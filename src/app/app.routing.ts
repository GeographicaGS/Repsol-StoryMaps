import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const appRoutes: Routes = [
  { path: '**', redirectTo: 'storymap/exit_operation'}
];

export const Routing = RouterModule.forRoot(appRoutes, { useHash: true });
