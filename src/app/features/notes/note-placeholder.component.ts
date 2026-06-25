import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-note-placeholder",
    templateUrl: './note-placeholder.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent {

}