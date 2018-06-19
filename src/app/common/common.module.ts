import { NgModule } from '@angular/core';
import { CommonModule as NGCommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CountoModule } from 'angular2-counto';

import { LocaleService } from './services/locale.service';
import { AuthInterceptor } from './services/auth/auth-interceptor';
import { AuthenticationService } from './services/auth/auth.service';
import { AuthGuard } from './services/auth/auth.guard';
import { UtilService } from './services/util.service';
import { MapService } from './services/map.service';

import { CommonRouting } from './common.routing';

import { MapComponent } from './map/map.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { CategoryTabComponent } from './components/category-tab/category-tab.component';
import { CounterComponent } from './components/counter/counter.component';

export function getCurrentLocaleFactory(localeService: LocaleService) {
  return localeService.locale;
}

const components = [
  MapComponent,
  HistogramComponent,
  CategoryTabComponent,
  CounterComponent
];

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  minScrollbarLength: 25
};

@NgModule({
  imports: [
    NGCommonModule,
    HttpClientModule,
    TranslateModule,
    PerfectScrollbarModule,
    FormsModule,
    CountoModule,
    CommonRouting
  ],
  declarations: components,
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    LocaleService,
    AuthenticationService,
    AuthGuard,
    UtilService,
    MapService
  ],
  exports : [...components, TranslateModule, PerfectScrollbarModule, HttpClientModule, CountoModule]
})
export class CommonModule { }
