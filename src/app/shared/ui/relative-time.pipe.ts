import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "relativeTime",
    standalone: true,
    pure: false,
})
export class RelativeTimePipe implements PipeTransform {
    public transform(date: Date): string {

        const diff = Math.abs(new Date().valueOf() - date.valueOf()) / 1000; //secunde

        if (diff < 60) {
            return "acum";
        } else if (diff >= 60 && diff < 60 * 60) {
            return "acum " + Math.round(diff / 60) + " minute";
        } else if (diff >= 60 * 60 && diff < 60 * 60 * 24) {
            return "acum " + Math.round(diff / (60 * 60)) + " ore";
        } else if (diff >= 60 * 60 * 24 && diff < 60 * 60 * 24 * 7) {
            return "acum " + Math.round(diff / (60 * 60 * 24)) + " zile";
        } else {
            return new Intl.DateTimeFormat('ro-RO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).format(date);
        }
    }
}

