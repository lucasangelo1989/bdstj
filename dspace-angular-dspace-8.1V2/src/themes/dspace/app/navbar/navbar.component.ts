import {
  isPlatformBrowser,
  AsyncPipe,
  NgClass,
  NgComponentOutlet,
  NgFor,
  NgIf,
} from '@angular/common';
import { Component, ViewChild, inject, PLATFORM_ID} from '@angular/core';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';
import { ThemedUserMenuComponent } from '../../../../app/shared/auth-nav-menu/user-menu/themed-user-menu.component';
import { RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { take } from 'rxjs/operators';

/**
 * Component representing the public navbar
 */
@Component({
  selector: 'ds-themed-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  standalone: true,
  animations: [
    slideMobileNav  // mantém a animação existente do mobile, se aplicável
  ],
  imports: [
    NgbDropdownModule,
    NgClass,
    NgIf,
    ThemedUserMenuComponent,
    NgFor,
    NgComponentOutlet,
    AsyncPipe,
    RouterModule,
    TranslateModule
  ],
})
export class NavbarComponent extends BaseComponent {
  private timeout: any;

  @ViewChild('dropdown') dropdown: NgbDropdown;
  readonly platformId = inject(PLATFORM_ID);

override ngOnInit() {
  super.ngOnInit();

  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  this.isAuthenticated$.pipe(take(1)).subscribe(isAuth => {
    if (!isAuth) {
      let attempts = 0;
      const maxAttempts = 30;

      const tryOpen = () => {
        attempts++;
        console.log('Tentando abrir dropdown - tentativa', attempts);

        if (this.dropdown?.open && typeof this.dropdown.open === 'function') {
          console.log('Abrindo dropdown automaticamente');
          this.dropdown.open();

          setTimeout(() => {
            const el = document.querySelector('.dropdown-menu');
            if (el && !el.classList.contains('show')) {
              el.classList.add('show');
              console.log('Classe .show aplicada manualmente ao dropdown-menu');
            }
 // Fechamento forçado após 60 segundos
            setTimeout(() => {
              console.log('Fechando dropdown após 60s');
              this.dropdown?.close?.();

              // Remove a classe .show manualmente para garantir que feche visualmente
              const el = document.querySelector('.dropdown-menu');
              if (el?.classList.contains('show')) {
                el.classList.remove('show');
                console.log('Classe .show removida manualmente do dropdown-menu');
              }
            }, 60000);

          }, 100); // Delay para DOM atualizar
        } else if (attempts < maxAttempts) {
          setTimeout(tryOpen, 200); // Tenta novamente
        } else {
          console.warn('Dropdown não disponível após múltiplas tentativas.');
        }
      };

      setTimeout(tryOpen, 500); // Primeira tentativa após 0.5s
    }
  });
}

onMouseEnter(dropdown: NgbDropdown) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    dropdown.open();
  }

  onMouseLeave(dropdown: NgbDropdown) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      if (dropdown.isOpen()) {
        dropdown.close();
      }
    }, 500);
  }
}
