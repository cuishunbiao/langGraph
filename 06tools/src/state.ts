import {z} from 'zod/v4';

export const Schema = z.object({
    topic: z.string().describe('文章主题'),
    title: z.string().describe('文章标题'),
    content: z.string().describe('文章内容'),
    summary: z.string().describe('文章摘要')
})

export type TArticle = z.infer<typeof Schema>