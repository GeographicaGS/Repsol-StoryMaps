import { NgModule } from '@angular/core';
import { CommonModule as NGCommonModule } from '@angular/common';
import { CommonModule } from '../../common/common.module';
import { StoryMapsRouting } from './story-maps.routing';
import { StoryMapComponent } from './story-map/story-map.component';
import { StoryMapService } from './story-map.service';
import { StationPopupComponent } from './component/station-popup/station-popup.component';

@NgModule({
  imports: [
    NGCommonModule,
    CommonModule,
    StoryMapsRouting,
  ],
  declarations: [StoryMapComponent, StationPopupComponent],
  providers: [
    StoryMapService
  ]
})
export class StoryMapsModule { }
