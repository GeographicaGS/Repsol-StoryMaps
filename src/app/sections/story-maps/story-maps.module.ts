import { NgModule } from '@angular/core';
import { CommonModule as NGCommonModule } from '@angular/common';
import { CommonModule } from '../../common/common.module';
import { StoryMapsRouting } from './story-maps.routing';
import { StoryMapComponent } from './story-map/story-map.component';

@NgModule({
  imports: [
    NGCommonModule,
    CommonModule,
    StoryMapsRouting
  ],
  declarations: [StoryMapComponent]
})
export class StoryMapsModule { }
