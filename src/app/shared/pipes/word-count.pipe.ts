import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'wordCount',
    standalone: true
})
export class WordCountPipe implements PipeTransform {
    public transform(content: string | undefined | null): number {
        if (!content) return 0;
        const cleanText = content.replace(/<[^>]*>/g, ' ');
        return cleanText.split(/\s+/).filter(item => item !== '').length;
    }
}