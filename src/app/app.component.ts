import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService, LocaleService } from './common/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor (
    private translate: TranslateService,
    private localeService: LocaleService,
    private auth: AuthenticationService
  ) {
    // Get browser language using localeService or force it
    const locale = this.localeService.locale;
    translate.setDefaultLang(locale);
    translate.use(locale);
  }

  // TODO: Check if this is still needed
  isLoggedIn() {
    return this.auth.isLoggedIn();
  }
}
