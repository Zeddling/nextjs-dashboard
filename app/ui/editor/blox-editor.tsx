'use client';

import dynamic from 'next/dynamic';
import {useEffect, useState} from "react";
import {setupSocialMediaPlugin} from "@/app/ui/editor/plugins/social-media.plugin";

const Editor = dynamic(() => import("@hugerte/hugerte-react").then(mod => mod.Editor), {
    ssr: false,
    loading: () => <div>Loading editor...</div>
});


export default function BloxEditor({ initialValue } : { initialValue: string }) {
    const [content, setContent] = useState(initialValue);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setContent(initialValue);
    }, [initialValue]);

    if (!isMounted) {
        return <div>Loading editor...</div>;
    }


    return (
       <>
           <Editor
               initialValue={initialValue}
               hugerteScriptSrc="https://cdn.jsdelivr.net/npm/hugerte@1/hugerte.min.js"
               value={content}
               onEditorChange={(newContent) => setContent(newContent)}
               init={{
                   height: 600,
                   menubar: true,
                   media_live_embeds: true,
                   setup: setupSocialMediaPlugin,
                   sandbox_iframes: false,
                   plugins: [
                       'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                       'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                       'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                   ],
                   images_file_types: 'jpg,svg,webp',
                   file_picker_types: 'file image media',
                   block_unsupported_drop: true,
                   statusbar: false,
                   toolbar:
                       'undo redo | blocks | bold italic forecolor | ' +
                       'alignleft aligncenter alignright alignjustify | ' +
                       'bullist numlist outdent indent | ' +
                       'socialmedia | ' +
                       'removeformat | help | image',
                   content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
            }
            iframe {
              max-width: 100%;
            }
            .twitter-tweet {
              margin: 10px auto !important;
            }
            .tiktok-embed {
              margin: 10px auto !important;
            }
          `,
                   // Optional: Add custom menu with social media submenu
                   menu: {
                       insert: {
                           title: 'Insert',
                           items: 'image link media table | socialmedia_menu'
                       }
                   }
               }}
           />
       </>
   );
}
