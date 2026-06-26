import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

@Component({
    selector: "app-modal",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './modal.component.html',
})
export class ModalComponent {
    public readonly title = input<string>('');
    public readonly confirmLabel = input<string>('');
    public readonly confirmDisabled = input<boolean>(false);

    public readonly cancel = output();
    public readonly confirm = output();


}