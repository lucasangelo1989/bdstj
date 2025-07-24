 import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  NgbModal,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { PaginationService } from '../../core/pagination/pagination.service';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { getFirstSucceededRemoteDataPayload } from '../../core/shared/operators';
import { SearchService } from '../../core/shared/search/search.service';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { SearchFilterService } from '../../core/shared/search/search-filter.service';
import {
  hasValue,
  isNotEmpty,
} from '../empty.util';
import { BrowserOnlyPipe } from '../utils/browser-only.pipe';
import { currentPath } from '../utils/route.utils';
import { ScopeSelectorModalComponent } from './scope-selector-modal/scope-selector-modal.component';

import { SortOptions } from '../../core/cache/models/sort-options.model';

import { RouteService } from '../../core/services/route.service';

@Component({
  selector: 'ds-base-search-form',
  styleUrls: ['./search-form.component.scss'],
  templateUrl: './search-form.component.html',
  standalone: true,
  imports: [FormsModule, NgIf, NgbTooltipModule, AsyncPipe, TranslateModule, BrowserOnlyPipe],
})
/**
 * Component that represents the search form
 */
export class SearchFormComponent implements OnInit, OnChanges {
  /**
   * The search query
   */
  @Input() query: string;
  // Adiciona as propriedades para receber os valores
  /**
   * The currently selected field for search (default: title)
   */
  selectedField: string = 'default';
  /**
   * True when the search component should show results on the current page
   */
  @Input() inPlaceSearch: boolean;

  /**
   * The currently selected scope object's UUID
   */
  @Input()
  scope = '';

  /**
   * Hides the scope in the url, this can be useful when you hardcode the scope in another way
   */
  @Input() hideScopeInUrl = false;

  selectedScope: BehaviorSubject<DSpaceObject> = new BehaviorSubject<DSpaceObject>(undefined);

  @Input() currentUrl: string;

  /**
   * Whether or not the search button should be displayed large
   */
  @Input() large = false;

  /**
   * The brand color of the search button
   */
  @Input() brandColor = 'primary';

  /**
   * The placeholder of the search input
   */
  @Input() searchPlaceholder: string;

  /**
   * Defines whether or not to show the scope selector
   */
  @Input() showScopeSelector = false;

  /**
   * Output the search data on submit
   */
  @Output() submitSearch = new EventEmitter<any>();

  constructor(
    protected router: Router,
    protected searchService: SearchService,
    protected searchFilterService: SearchFilterService,
    protected paginationService: PaginationService,
    protected searchConfig: SearchConfigurationService,
    protected modalService: NgbModal,
    protected dsoService: DSpaceObjectDataService,
    public dsoNameService: DSONameService,
    public routeService: RouteService,
  ) {}

ngOnInit(): void {
  // Restaura a consulta
  this.routeService.getQueryParameterValue('query').subscribe((query) => {
    const inputElement = document.getElementById('searchQuery') as HTMLInputElement;

    if (inputElement && isNotEmpty(query)) {
      let cleanValue = query;

      // Se tiver ":" (ex: dc.title:Teoria), pega só a parte depois
      if (query.includes(':')) {
        cleanValue = query.split(':').slice(1).join(':');
      }

      // 🔹 Remove +, (, ) — apenas para exibir no input
      cleanValue = cleanValue.replace(/[+()]/g, '').trim();

      inputElement.value = decodeURIComponent(cleanValue);
    }
  });

  // Restaura valor do filtro se houver
  this.routeService.getQueryParameterValue('selectedField').subscribe((field) => {
    if (isNotEmpty(field)) {
      this.selectedField = field;
    }
  });
}//fim ngOnInit

  /**
   * Retrieve the scope object from the URL so we can show its name
   */
  ngOnChanges(): void {
    if (isNotEmpty(this.scope)) {
      this.dsoService.findById(this.scope).pipe(getFirstSucceededRemoteDataPayload())
        .subscribe((scope: DSpaceObject) => this.selectedScope.next(scope));
    }
  }

  /**
   * Updates the search when the form is submitted
   * @param data Values submitted using the form
   */

/*onSubmit(data: any) {
  const inputElement = document.getElementById("searchQuery") as HTMLInputElement;
  let queryValue = inputElement.value.trim();

  //  Remove dois-pontos para evitar conflitos com a sintaxe do Solr
  queryValue = queryValue.replace(/:/g, '');
  queryValue = queryValue.replace(/’/g, "'"); // substitui apóstrofo tipográfico por simples

  // 🔹 Transforma os termos em "+palavra" e junta com espaço
  const splitQuery = queryValue
    .split(/\s+/)                       // separa por espaço
    .filter(word => word.length > 0)   // remove strings vazias
    .map(word => `+${word}`)           // adiciona "+" antes de cada palavra
    .join(' ');                         // junta novamente

  const queryParams: any = {
    page: 1, // Sempre volta para a primeira página ao buscar
  };

  if (this.scope) {
    queryParams.scope = this.scope;
  }

  if (isNotEmpty(splitQuery)) {
    if (this.selectedField && this.selectedField !== "default") {
      queryParams.query = `${this.selectedField}:( ${splitQuery} )`;
      queryParams.selectedField = this.selectedField;
      queryParams['spc.mm'] = '100%';
      queryParams['spc.sf'] = 'score';
    } else {
      queryParams.query = splitQuery;
    }
  }

  // Atualiza a URL com os novos parâmetros (limpa os antigos)
  this.router.navigate([], {
    queryParams,
    queryParamsHandling: '', // substitui tudo
  });

  // Dispara evento (caso outros componentes estejam escutando)
  this.submitSearch.emit(queryParams);

}//fim metodo
*/

onSubmit(data: any) {
  const inputElement = document.getElementById("searchQuery") as HTMLInputElement;
  let queryValue = inputElement.value.trim();

  const queryParams: any = {
    page: 1,
  };

  if (this.scope) {
    queryParams.scope = this.scope;
  }

  if (isNotEmpty(queryValue)) {
    if (this.selectedField && this.selectedField !== "default") 
     {

      	// 🔒 Evita formatar mais de uma vez
      	const jaFormatado = queryValue.startsWith(`${this.selectedField}:(`) || queryValue.startsWith('(');

     	 if (!jaFormatado) 
	{
        	// Substitui apóstrofos “fancy” por simples
        	queryValue = queryValue.replace(/[’‘`´]/g, "'");
        	queryValue = queryValue.replace(/:/g, '');
        	const palavras = queryValue.split(/\s+/).filter(p => p !== '');
        	const comPluses = palavras.map(p => `+${p}`).join(' ');
        	queryValue = `(${comPluses})`;
        }

      	queryParams.query = `${this.selectedField}:${queryValue}`;
      	queryParams.selectedField = this.selectedField;
     } 
     else 
     {
         queryValue = queryValue.replace(/[’‘`´]/g, "'");
        queryValue = queryValue.replace(/:/g, '');	
	queryParams.query = queryValue;
    }
  }

  this.router.navigate([], {
    queryParams,
    queryParamsHandling: '',
  });

  this.submitSearch.emit(queryParams);
}//fim metodo



  /**
   * Updates the search when the current scope has been changed
   * @param {string} scope The new scope
   */
  onScopeChange(scope: DSpaceObject) {
    this.updateSearch({ scope: scope ? scope.uuid : undefined });
    this.searchFilterService.minimizeAll();
  }

  /**
   * Updates the search URL
   * @param data Updated parameters
   */
  updateSearch(data: any) {
    const goToFirstPage = { 'spc.page': 1 };

    const queryParams = Object.assign(
      {
        ...goToFirstPage,
      },
      data,
    );
    if (hasValue(data.scope) && this.hideScopeInUrl) {
      delete queryParams.scope;
    }
     /*
    void this.router.navigate(this.getSearchLinkParts(), {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });*/
	
   void this.router.navigate(this.getSearchLinkParts(), {
	  queryParams: queryParams,
	});


  }

  /**
   * @returns {string} The base path to the search page, or the current page when inPlaceSearch is true
   */
  public getSearchLink(): string {
    if (this.inPlaceSearch) {
      return currentPath(this.router);
    }
    return this.searchService.getSearchLink();
  }

  /**
   * @returns {string[]} The base path to the search page, or the current page when inPlaceSearch is true, split in separate pieces
   */
  public getSearchLinkParts(): string[] {
    if (this.inPlaceSearch) {
      return [];
    }
    return this.getSearchLink().split('/');
  }

  /**
   * Open the scope modal so the user can select DSO as scope
   */
  openScopeModal() {
    const ref = this.modalService.open(ScopeSelectorModalComponent);
    ref.componentInstance.scopeChange.pipe(take(1)).subscribe((scope: DSpaceObject) => {
      this.selectedScope.next(scope);
      this.onScopeChange(scope);
    });
  }
}

