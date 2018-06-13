import { NgModule } from '@angular/core';
import { CommonModule as NGCommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { LocaleService } from './services/locale.service';
import { AuthInterceptor } from './services/auth/auth-interceptor';
import { AuthenticationService } from './services/auth/auth.service';
import { AuthGuard } from './services/auth/auth.guard';

import { CommonRouting } from './common.routing';

export function getCurrentLocaleFactory(localeService: LocaleService) {
  return localeService.locale;
}

const components = [
  // Place your components here
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
    AuthGuard
  ],
  exports : [...components, TranslateModule, PerfectScrollbarModule, HttpClientModule]
})
export class CommonModule { }
