import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoryMapComponent } from './story-map/story-map.component';


const routes: Routes = [
  {
    path: 'storymap/:history', component: StoryMapComponent
  }
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class StoryMapsRouting {}
