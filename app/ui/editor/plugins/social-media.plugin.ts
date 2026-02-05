import { Editor } from 'hugerte';

// Platform detection and URL patterns
const PLATFORM_PATTERNS = {
    instagram: {
        regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)\/?/,
        name: 'Instagram',
        icon: 'embed'
    },
    twitter: {
        regex: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/,
        name: 'X (Twitter)',
        icon: 'comment'
    },
    youtube: {
        regex: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
        name: 'YouTube',
        icon: 'embed-page'
    },
    tiktok: {
        regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/video\/(\d+)/,
        name: 'TikTok',
        icon: 'video'
    },
    vimeo: {
        regex: /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/,
        name: 'Vimeo',
        icon: 'embed-page'
    },
    facebook: {
        regex: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/share\/v\/([a-zA-Z0-9]+)\/?/,
        name: 'Facebook',
        icon: 'comment'
    },
    linkedin: {
        regex: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/posts\/([a-zA-Z0-9_-]+)/,
        name: 'LinkedIn',
        icon: 'comment'
    }
}

type PlatformKey = keyof typeof PLATFORM_PATTERNS

// Detect platform from URL
function detectPlatform(url: string): PlatformKey | null {
    for (const [platform, config] of Object.entries(PLATFORM_PATTERNS)) {
        if (config.regex.test(url)) {
            return platform as PlatformKey
        }
    }
    return null
}

// Platform-specific embed generators
function createInstagramEmbed(url: string): string {
    const match = url.match(PLATFORM_PATTERNS.instagram.regex)
    if (!match) return ''

    const postId = match[1]
    const postType = url.includes('/reel/') ? 'reel' : url.includes('/tv/') ? 'tv' : 'p'
    const embedUrl = `https://www.instagram.com/${postType}/${postId}/embed/`

    return `<iframe src="${embedUrl}" width="400" height="500" frameborder="0" scrolling="no" allowtransparency="true" allow="encrypted-media" loading="lazy" style="border: 1px solid #dbdbdb; border-radius: 4px; margin: 10px auto; display: block; max-width: 100%;"></iframe>`
}

function createTwitterEmbed(url: string): string {
    const match = url.match(PLATFORM_PATTERNS.twitter.regex)
    if (!match) return ''

    // Convert x.com to twitter.com for embed compatibility
    const embedUrl = url.replace('x.com', 'twitter.com')

    return `<blockquote class="twitter-tweet" data-width="550" style="margin: 10px auto;">
    <a href="${embedUrl}"></a>
  </blockquote>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
}

function createYouTubeEmbed(url: string): string {
    const match = url.match(PLATFORM_PATTERNS.youtube.regex)
    if (!match) return ''

    const videoId = match[1]
    const embedUrl = `https://www.youtube.com/embed/${videoId}`

    return `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" style="margin: 10px auto; display: block; max-width: 100%;"></iframe>`
}

function createTikTokEmbed(url: string): string {
    const match = url.match(PLATFORM_PATTERNS.tiktok.regex)
    if (!match) return ''

    const videoId = match[2]

    return `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}" style="max-width: 605px; min-width: 325px; margin: 10px auto;">
    <section>
      <a target="_blank" href="${url}">View on TikTok</a>
    </section>
  </blockquote>
  <script async src="https://www.tiktok.com/embed.js"></script>`
}

function createVimeoEmbed(url: string): string {
    const match = url.match(PLATFORM_PATTERNS.vimeo.regex)
    if (!match) return ''

    const videoId = match[1]
    const embedUrl = `https://player.vimeo.com/video/${videoId}`

    return `<iframe src="${embedUrl}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" style="margin: 10px auto; display: block; max-width: 100%;"></iframe>`
}

function createFacebookEmbed(url: string): string {
    const encodedUrl = encodeURIComponent(url)
    const embedUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500`

    return `<iframe src="${embedUrl}" width="500" height="600" style="border:none; overflow:hidden; margin: 10px auto; display: block; max-width: 100%;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe>`
}

function createLinkedInEmbed(url: string): string {
    // <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7422473651100446721?collapsed=1" height="895" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>
    const match = url.match(/ugcPost-(\d+)/);
    const postID = match ? match[1] : '';
    // LinkedIn requires their embed script and doesn't support iframe embeds well
    // We'll create a link placeholder that can be enhanced with their script
    return `<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:${postID}?collapsed=1" height="895" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>`
}

// Main embed creator
function createEmbed(url: string, platform: PlatformKey): string {
    switch (platform) {
        case 'instagram':
            return createInstagramEmbed(url)
        case 'twitter':
            return createTwitterEmbed(url)
        case 'youtube':
            return createYouTubeEmbed(url)
        case 'tiktok':
            return createTikTokEmbed(url)
        case 'vimeo':
            return createVimeoEmbed(url)
        case 'facebook':
            return createFacebookEmbed(url)
        case 'linkedin':
            return createLinkedInEmbed(url)
        default:
            return ''
    }
}

// Setup the social media embed plugin
export function setupSocialMediaPlugin(editor: Editor): void {
    // Register button for each platform
    Object.entries(PLATFORM_PATTERNS).forEach(([platform, config]) => {
        editor.ui.registry.addButton(platform as PlatformKey, {
            icon: config.icon,
            tooltip: `Insert ${config.name} Embed`,
            onAction: () => {
                openEmbedDialog(editor, platform as PlatformKey)
            }
        })
    })

    // Register a general "Social Media" button that auto-detects
    editor.ui.registry.addButton('socialmedia', {
        icon: 'embed',
        tooltip: 'Insert Social Media Embed',
        onAction: () => {
            openEmbedDialog(editor, null)
        }
    })

    // Add menu items
    editor.ui.registry.addNestedMenuItem('socialmedia_menu', {
        text: 'Social Media',
        icon: 'embed',
        getSubmenuItems: () => {
            return Object.entries(PLATFORM_PATTERNS).map(([platform, config]) => ({
                type: 'menuitem',
                text: config.name,
                icon: config.icon,
                onAction: () => openEmbedDialog(editor, platform as PlatformKey)
            }))
        }
    })
}

// Open dialog for embedding
function openEmbedDialog(editor: Editor, platformHint: PlatformKey | null): void {
    const platformName = platformHint ? PLATFORM_PATTERNS[platformHint].name : 'Social Media'

    // @ts-ignore
    editor.windowManager.open({
        title: `Insert ${platformName} Embed`,
        body: {
            type: 'panel',
            items: [
                {
                    type: 'input',
                    name: 'url',
                    label: 'URL',
                    placeholder: platformHint
                        ? getPlaceholder(platformHint)
                        : 'Paste any social media URL...'
                },
                // @ts-ignore
                ...(!platformHint ? [{
                    type: 'htmlpanel',
                    html: '<p style="margin: 10px 0; color: #666; font-size: 12px;">Supports: Instagram, X (Twitter), YouTube, TikTok, Vimeo, Facebook, LinkedIn</p>'
                }] : [])
            ]
        },
        buttons: [
            {
                type: 'cancel',
                text: 'Cancel'
            },
            {
                type: 'submit',
                text: 'Insert',
                primary: true
            }
        ],
        onSubmit: (dialog: any) => {
            const data = dialog.getData() as { url: string }
            const url = data.url.trim()

            // Detect platform if not specified
            const platform = platformHint || detectPlatform(url)

            if (!platform) {
                editor.notificationManager.open({
                    text: 'Could not detect platform. Please use a valid social media URL.',
                    type: 'error',
                    timeout: 3000
                })
                return
            }

            // Validate URL matches the platform
            if (!PLATFORM_PATTERNS[platform].regex.test(url)) {
                editor.notificationManager.open({
                    text: `Invalid ${PLATFORM_PATTERNS[platform].name} URL. Please check the format.`,
                    type: 'error',
                    timeout: 3000
                })
                return
            }

            const embedHtml = createEmbed(url, platform)

            if (embedHtml) {
                editor.insertContent(embedHtml)
                dialog.close()

                editor.notificationManager.open({
                    text: `${PLATFORM_PATTERNS[platform].name} embed inserted successfully!`,
                    type: 'success',
                    timeout: 2000
                })
            } else {
                editor.notificationManager.open({
                    text: 'Failed to create embed. Please check the URL.',
                    type: 'error',
                    timeout: 3000
                })
            }
        }
    })
}

// Get placeholder text for each platform
function getPlaceholder(platform: PlatformKey): string {
    const placeholders: Record<PlatformKey, string> = {
        instagram: 'https://www.instagram.com/p/ABC123/',
        twitter: 'https://twitter.com/username/status/123456',
        youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tiktok: 'https://www.tiktok.com/@username/video/123456',
        vimeo: 'https://vimeo.com/123456789',
        facebook: 'https://www.facebook.com/share/v/123456',
        linkedin: 'https://www.linkedin.com/posts/username-123'
    }
    return placeholders[platform]
}

// Export individual platform setup functions if needed
export function setupInstagramPlugin(editor: Editor): void {
    editor.ui.registry.addButton('instagram', {
        icon: 'embed',
        tooltip: 'Insert Instagram Post',
        onAction: () => openEmbedDialog(editor, 'instagram')
    })
}

export function setupTwitterPlugin(editor: Editor): void {
    editor.ui.registry.addButton('twitter', {
        icon: 'comment',
        tooltip: 'Insert X (Twitter) Post',
        onAction: () => openEmbedDialog(editor, 'twitter')
    })
}

export function setupYouTubePlugin(editor: Editor): void {
    editor.ui.registry.addButton('youtube', {
        icon: 'embed-page',
        tooltip: 'Insert YouTube Video',
        onAction: () => openEmbedDialog(editor, 'youtube')
    })
}

export function setupTikTokPlugin(editor: Editor): void {
    editor.ui.registry.addButton('tiktok', {
        icon: 'video',
        tooltip: 'Insert TikTok Video',
        onAction: () => openEmbedDialog(editor, 'tiktok')
    })
}