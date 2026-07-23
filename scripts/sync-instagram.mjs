#!/usr/bin/env node
/**
 * Baixa fotos públicas do @arcanjos_de_aco via API web do Instagram.
 * Output: shared/img/ + shared/data/instagram.json
 * Também baixa até 4 Reels/vídeos só para v2-territorio/assets/
 * Uso: npm run sync:instagram
 */
import { mkdir, rename, unlink, writeFile } from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'shared/img');
const GALLERY_DIR = path.join(OUT_DIR, 'gallery');
const DATA_FILE = path.join(ROOT, 'shared/data/instagram.json');

const V2_DIR = path.join(ROOT, 'v2-territorio/assets');
const V2_VIDEO_DIR = path.join(V2_DIR, 'video/reels');
const V2_POSTER_DIR = path.join(V2_DIR, 'img/reels');
const V2_REELS_JSON = path.join(V2_DIR, 'data/instagram-reels.json');

const USERNAME = 'arcanjos_de_aco';
const IG_APP_ID = '936619743392459';
const MAX_IMAGES = 20;
const MAX_REELS = 4;
/** Background clips only need a short, muted, fast-start MP4 */
const REEL_CLIP_SECONDS = 12;
const REEL_CRF = '28';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'X-IG-App-ID': IG_APP_ID,
  Accept: '*/*',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonViaCurl(url) {
  const { stdout, stderr } = await execFileAsync(
    'curl',
    [
      '-sL',
      '-A', HEADERS['User-Agent'],
      '-H', `X-IG-App-ID: ${IG_APP_ID}`,
      '-H', 'Accept: */*',
      '-w', '\n__HTTP_STATUS__:%{http_code}',
      url,
    ],
    { maxBuffer: 20 * 1024 * 1024 }
  );
  const marker = '\n__HTTP_STATUS__:';
  const idx = stdout.lastIndexOf(marker);
  const body = idx >= 0 ? stdout.slice(0, idx) : stdout;
  const status = idx >= 0 ? parseInt(stdout.slice(idx + marker.length), 10) : 0;
  if (status && status >= 400) {
    throw new Error(`HTTP ${status} ${url}`);
  }
  if (!body || !body.trim()) throw new Error(`Empty curl response ${url}`);
  let data;
  try {
    data = JSON.parse(body);
  } catch (_) {
    throw new Error(`Invalid JSON ${url}`);
  }
  if (data?.status === 'fail' || data?.message === 'useragent mismatch') {
    throw new Error(`API fail ${data?.message || data?.status} ${url}`);
  }
  return data;
}

async function fetchJson(url, retries = 4) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Prefer curl — Node fetch is rate-limited more aggressively by Instagram
      return await fetchJsonViaCurl(url);
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err);
      const rateLimited = /\b(429|503)\b/.test(msg);
      if (!rateLimited) {
        try {
          const res = await fetch(url, { headers: HEADERS });
          if (res.ok) return res.json();
          lastErr = new Error(`HTTP ${res.status} ${url}`);
          if (res.status !== 429 && res.status !== 503) throw lastErr;
        } catch (fetchErr) {
          const fetchMsg = String(fetchErr?.message || fetchErr);
          if (!/\b(429|503)\b/.test(fetchMsg)) throw fetchErr;
          lastErr = fetchErr;
        }
      }
      const wait = Math.min(60000, 3000 * Math.pow(2, attempt));
      console.warn(`Falha ao buscar API (${msg.slice(0, 80)}). Aguardando ${Math.round(wait / 1000)}s...`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

async function downloadFile(url, dest) {
  try {
    await execFileAsync(
      'curl',
      ['-sL', '-A', HEADERS['User-Agent'], '-H', `X-IG-App-ID: ${IG_APP_ID}`, '-o', dest, url],
      { maxBuffer: 10 * 1024 * 1024 }
    );
    return;
  } catch (_) {
    /* fallback to fetch */
  }
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function findFfmpeg() {
  for (const bin of ['ffmpeg', '/tmp/ffmpeg-static/ffmpeg', '/usr/bin/ffmpeg']) {
    try {
      await execFileAsync(bin, ['-version'], { timeout: 5000 });
      return bin;
    } catch (_) {
      /* try next */
    }
  }
  return null;
}

/**
 * Trim + compress Instagram reels for landing-page backgrounds.
 * Full-length IG downloads are often 40–70MB; web clips should stay ~2–4MB.
 */
async function compressReelForWeb(videoPath) {
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) {
    console.warn('⚠ ffmpeg não encontrado — reel mantido sem compressão (pode ficar pesado no mobile).');
    return false;
  }

  const tmpPath = `${videoPath}.web.tmp.mp4`;
  try {
    await execFileAsync(
      ffmpeg,
      [
        '-y',
        '-i', videoPath,
        '-t', String(REEL_CLIP_SECONDS),
        '-an',
        '-vf', 'scale=720:-2',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', REEL_CRF,
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        tmpPath,
      ],
      { maxBuffer: 20 * 1024 * 1024 }
    );
    await rename(tmpPath, videoPath);
    return true;
  } catch (err) {
    console.warn(`⚠ compressão falhou (${err.message}) — mantendo original`);
    try { await unlink(tmpPath); } catch (_) { /* ignore */ }
    return false;
  }
}

function captionOf(node) {
  const edges = node?.edge_media_to_caption?.edges;
  if (!edges?.length) return '';
  return edges[0].node.text.replace(/\s+/g, ' ').trim();
}

function isVideoNode(node) {
  return node?.is_video === true || node?.__typename === 'GraphVideo' || node?.product_type === 'clips';
}

function videoUrlFromNode(node) {
  if (node?.video_url) return node.video_url;
  if (Array.isArray(node?.video_versions) && node.video_versions[0]?.url) {
    return node.video_versions[0].url;
  }
  return null;
}

async function collectPosts() {
  const posts = [];
  const videos = [];
  const profileUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`;

  const data = await fetchJson(profileUrl);
  const user = data?.data?.user;
  if (!user?.edge_owner_to_timeline_media) {
    throw new Error('Resposta sem edge_owner_to_timeline_media');
  }
  const media = user.edge_owner_to_timeline_media;

  for (const edge of media.edges) {
    const node = edge.node;
    const caption = captionOf(node);
    const item = {
      shortcode: node.shortcode,
      url: node.display_url || node.thumbnail_src,
      caption,
      typename: node.__typename,
      isVideo: isVideoNode(node),
      videoUrl: videoUrlFromNode(node),
      permalink: `https://www.instagram.com/p/${node.shortcode}/`,
    };

    if (posts.length < MAX_IMAGES) {
      if (!(node.__typename === 'GraphVideo' && !node.display_url)) {
        posts.push(item);
      }
    }

    if (item.isVideo && item.url && videos.length < MAX_REELS) {
      const already = videos.some((v) => v.shortcode === item.shortcode);
      if (!already) videos.push(item);
    }
  }

  // Paginação GraphQL legada costuma responder 400; seguimos com a 1ª página.
  if (videos.length < MAX_REELS) {
    console.warn(`Apenas ${videos.length} vídeo(s) na timeline recente (máx. ${MAX_REELS}).`);
  }

  return { posts, videos };
}

/**
 * Resolve MP4 URL for a shortcode when timeline node lacks video_url.
 */
async function resolveVideoUrl(shortcode) {
  const endpoints = [
    `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`,
    `https://www.instagram.com/reel/${shortcode}/?__a=1&__d=dis`,
  ];

  for (const url of endpoints) {
    try {
      const data = await fetchJson(url);
      const media =
        data?.items?.[0] ||
        data?.graphql?.shortcode_media ||
        data?.data?.xdt_shortcode_media ||
        null;

      const fromNode = videoUrlFromNode(media);
      if (fromNode) return fromNode;

      const carousel = media?.carousel_media || media?.edge_sidecar_to_children?.edges;
      if (Array.isArray(carousel)) {
        for (const item of carousel) {
          const child = item?.node || item;
          const childUrl = videoUrlFromNode(child);
          if (childUrl) return childUrl;
        }
      }
    } catch (_) {
      /* try next */
    }
  }

  // oEmbed HTML sometimes embeds a CDN mp4
  try {
    const oembed = await fetchJson(
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(`https://www.instagram.com/p/${shortcode}/`)}`
    );
    const html = oembed?.html || '';
    const match = html.match(/https:\/\/[^"'\s]+\.mp4[^"'\s]*/);
    if (match) return match[0].replace(/&amp;/g, '&');
  } catch (_) {
    /* optional */
  }

  return null;
}

async function collectAndDownloadReels(videoPosts) {
  await mkdir(V2_VIDEO_DIR, { recursive: true });
  await mkdir(V2_POSTER_DIR, { recursive: true });
  await mkdir(path.dirname(V2_REELS_JSON), { recursive: true });

  console.log(`\nVídeos encontrados: ${videoPosts.length} (baixando até ${MAX_REELS} para v2)`);

  const reels = [];

  for (const post of videoPosts) {
    if (reels.length >= MAX_REELS) break;

    let videoUrl = post.videoUrl;
    if (!videoUrl) {
      console.log(`  Resolvendo video_url para ${post.shortcode}...`);
      videoUrl = await resolveVideoUrl(post.shortcode);
    }
    if (!videoUrl) {
      console.warn(`✗ ${post.shortcode}: sem video_url`);
      continue;
    }

    const videoName = `ig-${post.shortcode}.mp4`;
    const posterName = `ig-${post.shortcode}.jpg`;
    const videoDest = path.join(V2_VIDEO_DIR, videoName);
    const posterDest = path.join(V2_POSTER_DIR, posterName);

    try {
      await downloadFile(videoUrl, videoDest);
      if (post.url) await downloadFile(post.url, posterDest);
      const compressed = await compressReelForWeb(videoDest);
      console.log(`✓ reel ${videoName}${compressed ? ' (web)' : ''}`);

      const caption = post.caption || '';
      reels.push({
        video: `assets/video/reels/${videoName}`,
        poster: `assets/img/reels/${posterName}`,
        alt: caption || 'Arcanjos de Aço MC — Reel do Instagram',
        caption: caption.slice(0, 60) || 'Arcanjos de Aço',
        permalink: `https://www.instagram.com/reel/${post.shortcode}/`,
      });
    } catch (err) {
      console.warn(`✗ reel ${post.shortcode}: ${err.message}`);
    }
  }

  await writeFile(V2_REELS_JSON, JSON.stringify(reels, null, 2) + '\n');
  console.log(`${reels.length} reels em ${V2_VIDEO_DIR}`);
  console.log(`Manifest: ${V2_REELS_JSON}`);
  return reels;
}

async function main() {
  await mkdir(GALLERY_DIR, { recursive: true });
  await mkdir(path.dirname(DATA_FILE), { recursive: true });

  console.log(`Buscando posts de @${USERNAME}...`);
  const { posts, videos } = await collectPosts();
  console.log(`Encontrados ${posts.length} posts com imagem, ${videos.length} vídeos`);

  const gallery = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const name = `ig-${post.shortcode}.jpg`;
    const dest = path.join(GALLERY_DIR, name);
    try {
      await downloadFile(post.url, dest);
      console.log(`✓ ${name}`);
      gallery.push({
        file: `../shared/img/gallery/${name}`,
        alt: post.caption || 'Arcanjos de Aço MC — foto do Instagram',
        caption: post.caption.slice(0, 60) || 'Arcanjos de Aço',
        permalink: post.permalink,
      });
    } catch (err) {
      console.warn(`✗ ${post.shortcode}: ${err.message}`);
    }
  }

  if (!gallery.length) {
    console.error('Nenhuma imagem baixada.');
    process.exit(1);
  }

  try {
    const profile = await fetchJson(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`
    );
    const pic = profile.data.user.profile_pic_url_hd || profile.data.user.profile_pic_url;
    if (pic) {
      await downloadFile(pic, path.join(OUT_DIR, 'profile-pic.jpg'));
      console.log('✓ profile-pic.jpg');
    }
  } catch (_) { /* optional */ }

  await writeFile(DATA_FILE, JSON.stringify(gallery, null, 2) + '\n');

  const heroPost = posts.find(function (p) {
    return /estrada|rodando|rio de janeiro/i.test(p.caption);
  }) || posts[4] || posts[0];
  const aboutPost = posts.find(function (p) {
    return /fundado|2017|moto grupo/i.test(p.caption);
  }) || posts[2] || posts[0];

  await downloadFile(heroPost.url, path.join(OUT_DIR, 'hero.jpg')).catch(function () {});
  await downloadFile(aboutPost.url, path.join(OUT_DIR, 'about.jpg')).catch(function () {});
  console.log('✓ hero.jpg, about.jpg');

  console.log(`\n${gallery.length} fotos em ${GALLERY_DIR}`);
  console.log(`Manifest: ${DATA_FILE}`);

  await collectAndDownloadReels(videos);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
