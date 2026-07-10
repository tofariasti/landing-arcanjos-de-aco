#!/usr/bin/env node
/**
 * Baixa fotos públicas do @arcanjos_de_aco via API web do Instagram.
 * Output: shared/img/ + shared/data/instagram.json
 * Uso: npm run sync:instagram
 */
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'shared/img');
const GALLERY_DIR = path.join(OUT_DIR, 'gallery');
const DATA_FILE = path.join(ROOT, 'shared/data/instagram.json');
const USERNAME = 'arcanjos_de_aco';
const IG_APP_ID = '936619743392459';
const MAX_IMAGES = 20;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'X-IG-App-ID': IG_APP_ID,
};

async function fetchJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

function captionOf(node) {
  const edges = node?.edge_media_to_caption?.edges;
  if (!edges?.length) return '';
  return edges[0].node.text.replace(/\s+/g, ' ').trim();
}

async function collectPosts() {
  const posts = [];
  let url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`;

  while (url && posts.length < MAX_IMAGES) {
    const data = await fetchJson(url);
    const user = data.data.user;
    const media = user.edge_owner_to_timeline_media;

    for (const edge of media.edges) {
      if (posts.length >= MAX_IMAGES) break;
      const node = edge.node;
      if (node.__typename === 'GraphVideo' && !node.display_url) continue;
      posts.push({
        shortcode: node.shortcode,
        url: node.display_url || node.thumbnail_src,
        caption: captionOf(node),
        typename: node.__typename,
        permalink: `https://www.instagram.com/p/${node.shortcode}/`,
      });
    }

    if (media.page_info?.has_next_page && posts.length < MAX_IMAGES) {
      const cursor = media.page_info.end_cursor;
      const vars = encodeURIComponent(JSON.stringify({ id: user.id, first: 12, after: cursor }));
      url = `https://www.instagram.com/graphql/query/?query_hash=69cba40317214236ef40e7efa4fafbe6&variables=${vars}`;
    } else {
      url = null;
    }
  }

  return posts;
}

async function main() {
  await mkdir(GALLERY_DIR, { recursive: true });
  await mkdir(path.dirname(DATA_FILE), { recursive: true });

  console.log(`Buscando posts de @${USERNAME}...`);
  const posts = await collectPosts();
  console.log(`Encontrados ${posts.length} posts com imagem`);

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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
