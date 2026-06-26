import { InjectionToken } from '@angular/core';
import { IWorkspaceFacadeService } from '../interfaces/workspace-facade.service.interface';

export const WORKSPACE_FACADE_SERVICE_TOKEN = new InjectionToken<IWorkspaceFacadeService>('IWorkspaceFacadeService');