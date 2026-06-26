import { ChangeDetectorRef, inject, OnDestroy, Pipe, PipeTransform } from "@angular/core";
import { interval, Subscription } from "rxjs";

@Pipe({
    name: "relativeTime",
    standalone: true,
    pure: false,
})
export class RelativeTimePipe implements PipeTransform, OnDestroy {
    private readonly cdr = inject(ChangeDetectorRef);
    private latestValue: string = "";
    private subscription: Subscription | null = null;
    private lastDate: Date | null = null;

    public transform(date: Date): string {
        if (!this.lastDate || this.lastDate?.getTime() !== date.getTime()) {
            this.lastDate = date;
            this.updateValue(date);
            this.setupTimer(date);
        }
        return this.latestValue;
    }

    private updateValue(date: Date): void {
        const nextValue = this.calculateRelativeTime(date);

        if (nextValue !== this.latestValue) {
            this.latestValue = nextValue;
            this.cdr.markForCheck();
        }
    }

    private setupTimer(date: Date): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this.subscription = interval(30000).subscribe(() => {
            this.updateValue(date);
        });
    }

    private calculateRelativeTime(date: Date): string {
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

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }


    }
}

