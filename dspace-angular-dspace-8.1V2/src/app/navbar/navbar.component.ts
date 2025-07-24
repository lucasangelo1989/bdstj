import {
  AsyncPipe,
  NgClass,
  NgComponentOutlet,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import {
  select,
  Store,
} from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { AppState } from '../app.reducer';
import { isAuthenticated } from '../core/auth/selectors';
import { BrowseService } from '../core/browse/browse.service';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { slideMobileNav } from '../shared/animations/slide';
import { ThemedUserMenuComponent } from '../shared/auth-nav-menu/user-menu/themed-user-menu.component';
import {
  HostWindowService,
  WidthCategory,
} from '../shared/host-window.service';
import { MenuComponent } from '../shared/menu/menu.component';
import { MenuService } from '../shared/menu/menu.service';
import { MenuID } from '../shared/menu/menu-id.model';
import { ThemeService } from '../shared/theme-support/theme.service';

//custom apos aqui
import { map } from 'rxjs/operators';
import { EPerson } from '../core/eperson/models/eperson.model';
import { AuthService } from '../core/auth/auth.service';
import { switchMap } from 'rxjs/operators';



/**
 * Component representing the public navbar
 */
@Component({
  selector: 'ds-base-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  animations: [slideMobileNav],
  standalone: true,
  imports: [NgbDropdownModule, NgClass, NgIf, ThemedUserMenuComponent, NgFor, NgComponentOutlet, AsyncPipe, TranslateModule],
})
export class NavbarComponent extends MenuComponent implements OnInit {
  /**
   * The menu ID of the Navbar is PUBLIC
   * @type {MenuID.PUBLIC}
   */
  menuID = MenuID.PUBLIC;
  maxMobileWidth = WidthCategory.SM;
  private baseFontSize = 16; // Tamanho base da fonte
  private minFontSize = 12;  // Tamanho mínimo da fonte
  private maxFontSize = 24;  // Tamanho máximo da fonte
  private isHighContrast = false; // Estado inicial

  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated$: Observable<boolean>;

  public isMobile$: Observable<boolean>;
  public user$: Observable<EPerson | null>;

  constructor(protected menuService: MenuService,
    protected injector: Injector,
              public windowService: HostWindowService,
              public browseService: BrowseService,
              public authorizationService: AuthorizationDataService,
              public route: ActivatedRoute,
              protected themeService: ThemeService,
              private store: Store<AppState>,
	      private authService: AuthService
  ) {
    super(menuService, injector, authorizationService, route, themeService);
  }
    public adjustFontSize(action: 'increase' | 'decrease' | 'reset'): void {
    const root = document.documentElement;
    let currentFontSize = parseInt(getComputedStyle(root).getPropertyValue('font-size'), 10);

    if (action === 'increase' && currentFontSize < this.maxFontSize) {
      currentFontSize += 2;
    } else if (action === 'decrease' && currentFontSize > this.minFontSize) {
      currentFontSize -= 2;
    } else if (action === 'reset') {
      currentFontSize = this.baseFontSize;
    }
    root.style.fontSize = `${currentFontSize}px`;
    localStorage.setItem('fontSize', currentFontSize.toString());
  }//fim metodo

public toggleHighContrast(): void {
    const root = document.documentElement;
    const img = document.getElementById("banner-da-home") as HTMLImageElement;
    const originalSrc = "assets/images/home-banner.png";
    const newSrc = "assets/images/background-BDJUR-PeB.jpg";
    if (this.isHighContrast) {
      root.classList.remove('high-contrast');      
      img.src = originalSrc;
    } else {
      root.classList.add('high-contrast');
      img.src = newSrc;
    }
    this.isHighContrast = !this.isHighContrast;
  }//fim metodo

public toggleMenu(): void {
  const navbar = document.getElementById('navbarNav');
  if (navbar) {
    navbar.classList.toggle('show');
  }
}//fim metodo

public getEmail(email: string): string {
  if (!email) {
    return 'usuário'; // Nome padrão se não estiver autenticado ou sem email
  }
  return email.split('@')[0]; // Divide pelo espaço e retorna o primeiro elemento
}

 public getFirstName(fullName: string): string {
  if (!fullName) {
    return 'usuário'; // Nome padrão se não estiver autenticado ou sem nome
  }
  return fullName.split(' ')[0]; // Divide pelo espaço e retorna o primeiro elemento
}


  ngOnInit(): void {
    super.ngOnInit();
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
    this.isAuthenticated$ = this.store.pipe(select(isAuthenticated));
    this.user$ = this.isAuthenticated$.pipe(
      switchMap((authenticated) => {
        if (authenticated) {
          return this.authService.getAuthenticatedUserFromStore();
        }
        return of(null); // Retorna um Observable com valor null se não estiver autenticado
      })
    );
    if (this.isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }//fim ngOnInit
}
