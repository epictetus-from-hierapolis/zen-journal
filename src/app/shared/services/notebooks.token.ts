import { InjectionToken } from "@angular/core";
import { INotebooksService } from "./notebooks.service.interface";

export const NOTEBOOKS_SERVICE_TOKEN = new InjectionToken<INotebooksService>('INotebooksService');