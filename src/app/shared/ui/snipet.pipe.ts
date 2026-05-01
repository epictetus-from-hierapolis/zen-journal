import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'snippet',
    standalone: true
})
export class SnippetPipe implements PipeTransform {
    public transform(content: string, query: string): string {
        const index = content.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return '';

        const start = Math.max(0, index - 40);
        const end = Math.min(content.length, index + 40);
        return '...' + content.slice(start, end) + '...';
    }
}