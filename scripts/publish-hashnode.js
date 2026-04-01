#!/usr/bin/env node
/**
 * Auto-publish to Hashnode (simple version)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const HASHNODE_API = 'https://gql.hashnode.com';
const HASHNODE_TOKEN = 'b8936b7b-cf6c-402c-835c-6196ce29d442';
const PUBLICATION_ID = '69cca9e6e4688e4edd96e0b6';

function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const payload = { query };
    if (Object.keys(variables).length > 0) payload.variables = variables;
    const match = query.match(/^(\w+)\s*\{/);
    if (match) payload.operationName = match[1];

    const data = JSON.stringify(payload);
    const options = {
      hostname: 'gql.hashnode.com',
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': HASHNODE_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.errors) {
            console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
            reject(new Error(json.errors[0].message));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.write(data);
    req.end();
  });
}

async function publishArticle({ title, content, tags = [], slug = null }) {
  if (typeof title !== 'string') throw new Error('title must be string');
  const mutation = `
    mutation CreateDraft(
      $title: String!
      $contentMarkdown: String!
      $tags: [CreateDraftTagInput!]!
      $slug: String
      $publicationId: ID!
    ) {
      createDraft(
        input: {
          title: $title
          contentMarkdown: $contentMarkdown
          tags: $tags
          slug: $slug
          publicationId: $publicationId
        }
      ) {
        draft {
          id
          slug
          title
        }
      }
    }
  `;

  const tagInputs = tags.map(tag => ({
    slug: tag.toLowerCase().replace(/\s+/g, '-'),
    name: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()
  }));
  const defaultSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const variables = {
    title,
    contentMarkdown: content,
    tags: tagInputs,
    slug: slug || defaultSlug,
    publicationId: PUBLICATION_ID
  };

  const result = await graphqlRequest(mutation, variables);
  if (result.createDraft && result.createDraft.draft) {
    return result.createDraft.draft;
  }
  throw new Error('Cannot find draft in response');
}

async function main() {
  try {
    const filePath = process.argv[2];
    if (!filePath) {
      console.error('Usage: publish-hashnode <markdown-file>');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Simple title extraction: first "# " heading or fallback to filename
    const titleMatch = fileContent.match(/^#\s+(.+)$/m);
    let title;
    if (titleMatch) {
      title = titleMatch[1];
      if (typeof title !== 'string') {
        console.error('Debug: titleMatch:', titleMatch);
        throw new Error('Extracted title is not a string');
      }
      title = title.trim();
    } else {
      title = path.basename(filePath, '.md');
    }

    // Remove frontmatter if exists
    const content = fileContent.replace(/^---\n[\s\S]*?\n---\n/, '');

    // Fixed tags for testing
    const tags = ['openclaw', 'ai', 'productivity', 'automation'];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    console.log(`📝 Publishing to Hashnode: ${title}`);
    console.log(`   Publication ID: ${PUBLICATION_ID}`);
    console.log(`   Tags: ${tags.join(', ')}`);

    const post = await publishArticle({ title, content, tags, slug });

    console.log('✅ Published successfully!');
    console.log(`   URL: https://hashnode.com/${post.slug}`);
    console.log(`   Post ID: ${post.id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
