import { Component } from '@angular/core';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    title = 'Elite BGS';
    isLightTheme = true;
    isDarkTheme = false;
    switchTheme = 'Dark';

    onClickThemeSwitch() {
        if (this.isLightTheme) {
            this.isLightTheme = false;
            this.isDarkTheme = true;
            this.switchTheme = 'Light';
        } else if (this.isDarkTheme) {
            this.isLightTheme = true;
            this.isDarkTheme = false;
            this.switchTheme = 'Dark';
        }
    }
}
