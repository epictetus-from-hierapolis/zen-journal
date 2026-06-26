import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'snippet',
    standalone: true
})
export class SnippetPipe implements PipeTransform {
    public transform(content: string | undefined | null, query: string): string {
        if (!content) return '';
        const cleanText = content.replace(/<[^>]*>/g, ' ');
        const index = cleanText.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return '';

        const start = Math.max(0, index - 40);
        const end = Math.min(cleanText.length, index + 40);
        return '...' + cleanText.slice(start, end) + '...';
    }
}