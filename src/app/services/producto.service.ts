import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GeneralService } from './general.service';
import { Observable, ReplaySubject, of, throwError } from 'rxjs';
import { AppUnitsGetDto } from '../models/app-units-get-dto';
import { AppProductsGetDto } from '../models/app-products-get-dto';
import { catchError } from 'rxjs/Operators';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  basePath: string;
  accionPath: string;
  controller: string;

  allProducts$ = new ReplaySubject<any>();
  product$ = new ReplaySubject<AppProductsGetDto>();

  constructor(private http: HttpClient, private gensvc: GeneralService) {
    this.basePath = gensvc.basePath;
  }

  // ------ Modulo de productos---------- //

  GetAllAppProducts(data): void {
    this.controller = 'AppProducts/';
    this.accionPath = 'GetAllAppProducts';
    console.log(data);
    this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .subscribe((result) => {
        console.log('consulta de productos', result);
        this.allProducts$.next(result);
      });
  }

  GetAll(data): Observable<any> {
    this.controller = 'AppProducts/';
    this.accionPath = 'GetAllAppProducts';
    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  buscaProductoCantidad(data): Observable<any> {
    this.controller = 'AppRecipesByAppDetailQuotes/';
    this.accionPath = 'GetPrecioProductoCantidad';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  getPrice(data): Observable<any> {
    this.controller = 'AppRecipesByAppDetailQuotes/';
    this.accionPath = 'GetPrice';
    /*return this.http.post<any>(this.basePath + this.controller + this.accionPath, JSON.stringify(data)).pipe(
        catchError(this.handleError)
      );*/
    console.log(data);
    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe(
        catchError((error) => {
          console.log(error);
          if (error.error instanceof ErrorEvent) {
            console.log(`Error: ${error.error.message}`);
          } else {
            console.log(`Error: ${error.message}`);
          }
          return of([]);
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }

  InsertProduct(data): Observable<any> {
    this.controller = 'AppProducts/';
    this.accionPath = 'InsertAppProducts';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  UpdateProduct(data): Observable<any> {
    this.controller = 'AppProducts/';
    this.accionPath = 'UpdateAppProducts';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  DeleteProduct(data): Observable<any> {
    this.controller = 'AppProducts/';
    this.accionPath = 'DeleteProduct';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }
  CopyProduct(data): Observable<any> {
    this.controller = 'AppProducts/';
    this.accionPath = 'CopyProduct';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  SubCategoryGetAll(data) {
    this.controller = 'AppSubCategory/';
    this.accionPath = 'GetAll';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  GetAllPriceByProduct(data): Observable<any> {
    this.controller = 'AppPrice/';

    this.accionPath = 'GetAllPriceByProductId';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  CreateAppPrice(data): Observable<any> {
    this.controller = 'AppPrice/';

    this.accionPath = 'CreateAppPrice';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  UpdateAppPrice(data): Observable<any> {
    this.controller = 'AppPrice/';

    this.accionPath = 'UpdateAppPrice';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  DeletePrice(data): Observable<any> {
    this.controller = 'AppPrice/';

    this.accionPath = 'DeletePrice';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  //----------------------------------------//

  GetAllAppVariableSearchAgrupado(data): Observable<any> {
    this.controller = 'AppVariableSearch/';

    this.accionPath = 'GetAllAppVariableSearchAgrupado';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  GetAllAppVariableSearch(data): Observable<any> {
    this.controller = 'AppVariableSearch/';

    this.accionPath = 'GetAllAppVariableSearch';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  GetAllProductusByCriteria(data): Observable<any> {
    this.controller = 'AppProducts/';

    this.accionPath = 'GetAllAppProductsByVariable';
    console.log('GetAllProductusByCriteria', data);
    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  //------ CALCULO DE PRECIO PRODUCTO --------//

  GetTemplateConversionUnit(data): Observable<any> {
    this.controller = 'AppTemplateConversionUnit/';

    this.accionPath = 'GetTemplateConversionUnit';
    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  //api/AppDetailQuotesConversionUnit/CreateAppDetailQuotesConversionUnit
  //REEMPLAZADO AL IMPLEMENTAR CALCULO DE PRECIOS SIN CREAR DETALLE
  CreateAppDetailQuotesConversionUnit(data): Observable<any> {
    this.controller = 'AppDetailQuotesConversionUnit/';

    this.accionPath = 'CreateAppDetailQuotesConversionUnit';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  //Llamada para subir IMAGEN y actualizar maestro de productos.
  UpdateProductImage(data): Observable<any> {
    this.controller = 'CobAdjuntosCobranza/';
    this.accionPath = 'UpdateImageAppProduct';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }

  //Llamado desde la calculadora para calcular precio lista
  ConversionUnitGeneric(data): Observable<any> {
    this.controller = 'AppDetailQuotesConversionUnit/';

    this.accionPath = 'ConversionUnitGeneric';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data)
      )
      .pipe();
  }
}
