import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Conversion } from 'src/app/models/conversion';
import { AppProductsGetDto } from 'src/app/models/app-products-get-dto';
import { AppProductConversionGetDto } from 'src/app/models/app-product-conversion-get-dto';
import { AppSubcategoryGetDto } from 'src/app/models/app-subcategory-get-dto';
import { AppVariableSearchGetDto } from 'src/app/models/app-variable-search-get-dto';
import { MunicipioGetDto } from 'src/app/models/municipio-get-dto';
import { CondicionPagoDto } from 'src/app/models/CondicionPagoDto';
import { GetPriceQueryFilter } from 'src/app/interfaces/get-price-fileter';
import { ProductoService } from 'src/app/services/producto.service';
import { GeneralService } from 'src/app/services/general.service';
import { CondicionesPagoService } from 'src/app/services/condiciones-pago.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { BuscadorMunicipioComponent } from 'src/app/components/buscador-municipio/buscador-municipio.component';

interface NaturalDraft {
  cantidad: number;
  medidaBasica: number;
  medidaOpuesta: number;
  municipioTexto: string;
  condicionTexto: string;
  unidadTexto: string;
  productoTexto: string;
  productoBusqueda: string;
}

interface MatchedVariable {
  variableDescription: string;
  item: AppVariableSearchGetDto;
  score: number;
}

const GENERAL_SUBCATEGORY_IDS = [2];

@Component({
  selector: 'app-search-natural',
  templateUrl: './search-natural.page.html',
  styleUrls: ['./search-natural.page.scss'],
})
export class SearchNaturalPage implements OnInit {
  form: FormGroup;
  textoNatural =
    'Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND';
  mensaje = '';
  showLoading = false;
  buscandoPrecio = false;
  characteristicSelectOptions = {
    cssClass: 'natural-characteristic-select',
    header: 'Seleccione caracteristica',
  };

  subcategorias: AppSubcategoryGetDto[] = [];
  condiciones: CondicionPagoDto[] = [];
  variableGroups: any[] = [];
  variablesSeleccionadas: MatchedVariable[] = [];
  productosCandidatos: AppProductsGetDto[] = [];
  municipiosCandidatos: MunicipioGetDto[] = [];
  private ultimoDraft: NaturalDraft = null;

  appProduct: AppProductsGetDto = null;
  appProductConversionGetDto: AppProductConversionGetDto = null;
  subCategoria: AppSubcategoryGetDto = null;
  condicionPagoDto: CondicionPagoDto = null;
  municipio: MunicipioGetDto = null;

  precioMasFlete = 0;
  precioMaximoMasFlete = 0;
  unitPriceBaseProduction = 0;
  flete = 0;
  calculoId = 0;

  constructor(
    private formBuilder: FormBuilder,
    private productoService: ProductoService,
    private condicionesPago: CondicionesPagoService,
    private clienteService: ClienteService,
    private modalCtrl: ModalController,
    public generalService: GeneralService,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.loadCatalogosBase();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      idMunicipio: [0, [Validators.required, Validators.min(1)]],
      descripcionMunicipio: ['', []],
      condicionPago: [40, [Validators.required]],
      subCategoriaId: [0, [Validators.required, Validators.min(1)]],
      unidad: ['', [Validators.required, Validators.minLength(1)]],
      unidadId: [0, []],
      cantidadSolicitada: [0, [Validators.required, Validators.min(0.0000001)]],
      cantidad: [0, []],
      medidaBasica: [0, []],
      medidaOpuesta: [0, []],
      precio: [0, []],
      total: [0, []],
    });
  }

  private loadCatalogosBase() {
    const subcategoryAll = JSON.parse(localStorage.getItem('listSubcategoria')) || [];
    this.subcategorias = subcategoryAll
      .filter((item) => item.active === true)
      .sort((a, b) => (a.description < b.description ? -1 : 1));

    this.condicionesPago
      .GetAllCondicionPago({ codigo: 0 })
      .subscribe((resp) => {
        this.condiciones = resp?.data || [];
        this.condicionPagoDto =
          this.condiciones.find((item) => Number(item.codigo) === 40) ||
          this.condiciones[0] ||
          null;
        if (this.condicionPagoDto) {
          this.form.get('condicionPago').setValue(this.condicionPagoDto.codigo);
        }
      });
  }

  interpretarTexto() {
    this.resetResultado();
    const draft = this.extraerDraft(this.textoNatural);
    this.ultimoDraft = draft;

    this.form.patchValue({
      cantidadSolicitada: draft.cantidad || this.form.get('cantidadSolicitada').value,
      medidaBasica: draft.medidaBasica || 0,
      medidaOpuesta: draft.medidaOpuesta || 0,
    });

    this.showLoading = true;
    this.mensaje = 'Interpretando consulta';
    this.productoService.NaturalPriceQuery(this.buildNaturalPriceQueryPayload(draft)).subscribe({
      next: (resp) => {
        this.showLoading = false;
        if (!this.aplicarNaturalPriceQueryResponse(resp, draft)) {
          this.interpretarTextoLocal(draft);
        }
      },
      error: () => {
        this.showLoading = false;
        this.interpretarTextoLocal(draft);
      },
    });
  }

  private interpretarTextoLocal(draft: NaturalDraft) {
    this.resolverCondicion(draft);
    this.resolverSubcategoria(draft);
    this.resolverMunicipio(draft);

    if (!this.subCategoria) {
      this.mensaje = 'No pude identificar la categoria. Seleccione una categoria o sea mas especifico.';
      return;
    }

    this.cargarVariablesYProductos(draft);
  }

  private buildNaturalPriceQueryPayload(draft: NaturalDraft): any {
    return {
      query: this.textoNatural,
      text: this.textoNatural,
      texto: this.textoNatural,
      textoNatural: this.textoNatural,
      cantidad: draft.cantidad || Number(this.form.get('cantidadSolicitada').value || 0),
      cantidadSolicitada:
        draft.cantidad || Number(this.form.get('cantidadSolicitada').value || 0),
      largo: draft.medidaBasica || Number(this.form.get('medidaBasica').value || 0),
      ancho: draft.medidaOpuesta || Number(this.form.get('medidaOpuesta').value || 0),
      medidaBasica:
        draft.medidaBasica || Number(this.form.get('medidaBasica').value || 0),
      medidaOpuesta:
        draft.medidaOpuesta || Number(this.form.get('medidaOpuesta').value || 0),
      municipio: draft.municipioTexto,
      condicionPago: Number(this.form.get('condicionPago').value || 0),
      unidad: draft.unidadTexto,
      producto: draft.productoBusqueda || draft.productoTexto,
      subCategoriaId: Number(this.form.get('subCategoriaId').value || 0),
    };
  }

  private aplicarNaturalPriceQueryResponse(resp: any, draft: NaturalDraft): boolean {
    const data = resp?.data || resp;
    if (!data) {
      return false;
    }

    this.aplicarDraftDesdeApi(data, draft);
    this.aplicarCatalogosDesdeApi(data);

    const productos = this.getFirstArray(
      data.productosCandidatos,
      data.productos,
      data.products,
      data.candidates,
    );

    if (productos.length > 0) {
      this.productosCandidatos = productos;
    }

    const producto = data.producto || data.product || data.appProduct;
    if (producto) {
      this.seleccionarProducto(producto, false);
    }

    const getPricePayload = this.getGetPricePayloadFromNaturalResponse(data);
    if (getPricePayload) {
      this.consultarPrecioConPayload(getPricePayload);
    }

    const hasResolvedData =
      !!producto ||
      productos.length > 0 ||
      !!getPricePayload ||
      this.variablesSeleccionadas.length > 0;

    if (productos.length > 0 && !this.appProduct) {
      this.aplicarProductosEncontrados(draft, false);
    }

    if (hasResolvedData && !this.mensaje) {
      this.mensaje = this.appProduct
        ? ''
        : 'Consulta interpretada por la API. Seleccione el producto correcto.';
    }

    return hasResolvedData;
  }

  private aplicarDraftDesdeApi(data: any, fallback: NaturalDraft) {
    const draft = data.draft || data.query || data.interpretacion || {};
    const cantidad = Number(
      draft.cantidad || data.cantidad || data.cantidadSolicitada || fallback.cantidad || 0,
    );
    const medidaBasica = Number(
      draft.medidaBasica || data.medidaBasica || data.largo || fallback.medidaBasica || 0,
    );
    const medidaOpuesta = Number(
      draft.medidaOpuesta || data.medidaOpuesta || data.ancho || fallback.medidaOpuesta || 0,
    );

    this.form.patchValue({
      cantidadSolicitada: cantidad || this.form.get('cantidadSolicitada').value,
      medidaBasica,
      medidaOpuesta,
    });
  }

  private aplicarCatalogosDesdeApi(data: any) {
    const subCategoriaApi = data.subCategoria || data.subcategory || data.appSubCategory;
    const subCategoriaId = Number(
      data.subCategoriaId || data.subcategoryId || subCategoriaApi?.id || 0,
    );
    if (subCategoriaApi) {
      this.subCategoria = subCategoriaApi;
      this.form.get('subCategoriaId').setValue(subCategoriaApi.id, { emitEvent: false });
    } else if (subCategoriaId > 0) {
      this.subCategoria =
        this.subcategorias.find((item) => Number(item.id) === subCategoriaId) || null;
      this.form.get('subCategoriaId').setValue(subCategoriaId, { emitEvent: false });
    }

    const condicionApi = data.condicionPago || data.paymentCondition;
    const condicionCodigo = Number(
      data.condicionPagoCodigo || data.condicionDePago || condicionApi?.codigo || 0,
    );
    if (condicionApi && condicionApi.codigo) {
      this.condicionPagoDto = condicionApi;
      this.form.get('condicionPago').setValue(condicionApi.codigo);
    } else if (condicionCodigo > 0) {
      this.condicionPagoDto =
        this.condiciones.find((item) => Number(item.codigo) === condicionCodigo) || null;
      this.form.get('condicionPago').setValue(condicionCodigo);
    }

    const municipioApi = data.municipio || data.municipality;
    if (municipioApi) {
      this.seleccionarMunicipio(municipioApi);
    }

    const variables = this.getFirstArray(
      data.variablesSeleccionadas,
      data.variables,
      data.characteristics,
    );
    if (variables.length > 0) {
      this.variablesSeleccionadas = variables.map((item) => ({
        variableDescription:
          item.variableDescription || item.descripcionVariable || item.description || '',
        item: item.item || item,
        score: item.score || 1,
      }));
    }
  }

  private getFirstArray(...values: any[]): any[] {
    const value = values.find((item) => Array.isArray(item));
    return value || [];
  }

  private getGetPricePayloadFromNaturalResponse(data: any): GetPriceQueryFilter | null {
    const payload =
      data.getPricePayload ||
      data.getPriceQueryFilter ||
      data.priceQueryFilter ||
      data.parametrosGetPrice ||
      data.parametrosPrecio ||
      data;

    const appProuctId = Number(
      payload.appProuctId ||
        payload.appProductId ||
        payload.productId ||
        payload.productoId ||
        payload.appProduct?.id ||
        payload.producto?.id ||
        this.appProduct?.id ||
        0,
    );
    const idMunicipio = Number(
      payload.idMunicipio ||
        payload.municipioId ||
        payload.municipio?.recnum ||
        payload.municipality?.recnum ||
        this.form.get('idMunicipio').value ||
        0,
    );
    const cantidad = Number(
      payload.cantidad ||
        payload.cantidadSolicitada ||
        payload.quantity ||
        this.form.get('cantidadSolicitada').value ||
        0,
    );
    const condicionDePago = Number(
      payload.condicionDePago ||
        payload.condicionPago ||
        payload.condicionPagoCodigo ||
        payload.paymentConditionCode ||
        this.form.get('condicionPago').value ||
        0,
    );
    const unidadId = Number(
      payload.unidadId ||
        payload.unidad ||
        payload.appUnitsId ||
        payload.unitId ||
        this.form.get('unidadId').value ||
        this.appProductConversionGetDto?.appUnitsIdAlternativa ||
        0,
    );

    if (appProuctId <= 0 || idMunicipio <= 0 || cantidad <= 0) {
      return null;
    }

    return {
      idMunicipio,
      appProuctId,
      cantidad,
      largo: Number(payload.largo || payload.medidaBasica || payload.length || 0),
      ancho: Number(payload.ancho || payload.medidaOpuesta || payload.width || 0),
      unidadId,
      unidad: unidadId,
      condicionDePago,
    };
  }

  private consultarPrecioConPayload(payload: GetPriceQueryFilter) {
    this.form.patchValue({
      idMunicipio: payload.idMunicipio,
      cantidadSolicitada: payload.cantidad,
      medidaBasica: payload.largo || 0,
      medidaOpuesta: payload.ancho || 0,
      unidadId: payload.unidadId || payload.unidad || 0,
      condicionPago: payload.condicionDePago || this.form.get('condicionPago').value,
    });

    this.buscandoPrecio = true;
    this.mensaje = 'Buscando precio';
    this.productoService.getPrice(payload).subscribe({
      next: (resp) => {
        this.buscandoPrecio = false;
        this.aplicarResultadoPrecio(resp, payload.cantidad);
      },
      error: () => {
        this.buscandoPrecio = false;
        this.mensaje = 'No fue posible calcular el precio';
      },
    });
  }

  private resetResultado() {
    this.mensaje = '';
    this.variableGroups = [];
    this.variablesSeleccionadas = [];
    this.productosCandidatos = [];
    this.municipiosCandidatos = [];
    this.ultimoDraft = null;
    this.appProduct = null;
    this.appProductConversionGetDto = null;
    this.precioMasFlete = 0;
    this.precioMaximoMasFlete = 0;
    this.unitPriceBaseProduction = 0;
    this.flete = 0;
    this.calculoId = 0;
    this.form.patchValue({ precio: 0, total: 0, cantidad: 0, unidad: '', unidadId: 0 });
  }

  private extraerDraft(texto: string): NaturalDraft {
    const normalized = this.normalize(texto);
    const medidas = this.extractMedidas(normalized);

    return {
      cantidad: this.extractCantidad(normalized),
      medidaBasica: medidas.basica,
      medidaOpuesta: medidas.opuesta,
      municipioTexto: this.extractAfter(normalized, ['para ', 'en ', 'hacia ']),
      condicionTexto: this.extractCondicionTexto(normalized),
      unidadTexto: this.extractUnidadTexto(normalized),
      productoTexto: normalized,
      productoBusqueda: this.extractProductoBusqueda(normalized),
    };
  }

  private resolverCondicion(draft: NaturalDraft) {
    const texto = this.normalize(`${draft.condicionTexto} ${this.textoNatural}`);
    const synonyms = [
      { words: ['anticipado', 'prepago', '100 porc'], target: 'anticipado' },
      { words: ['contado', 'inmediato'], target: 'contado' },
      { words: ['credito', 'dias'], target: 'credito' },
    ];
    let best = this.bestByText(this.condiciones, texto, (item) => item.descripcion);

    for (const synonym of synonyms) {
      if (synonym.words.some((word) => texto.includes(word))) {
        const candidate = this.bestByText(
          this.condiciones,
          synonym.target,
          (item) => item.descripcion,
        );
        if (!best || candidate.score > best.score) {
          best = candidate;
        }
      }
    }

    if (best && best.score > 0.2) {
      this.condicionPagoDto = best.item;
      this.form.get('condicionPago').setValue(best.item.codigo);
    }
  }

  private resolverSubcategoria(draft: NaturalDraft) {
    const best = this.bestByText(
      this.subcategorias,
      draft.productoBusqueda || draft.productoTexto,
      (item) => item.description,
    );

    if (best && best.score > 0.25) {
      this.subCategoria = best.item;
      this.form.get('subCategoriaId').setValue(best.item.id, { emitEvent: false });
    }
  }

  private resolverMunicipio(draft: NaturalDraft) {
    if (!draft.municipioTexto) {
      return;
    }

    this.clienteService
      .ListMunicipios({ searchText: draft.municipioTexto })
      .subscribe((resp) => {
        this.municipiosCandidatos = resp?.data || [];
        const best = this.bestByText(
          this.municipiosCandidatos,
          draft.municipioTexto,
          (item) => `${item.descMunicipio} ${item.capitalMcpo}`,
        );

        if (best && best.score > 0.35) {
          this.seleccionarMunicipio(best.item);
        }
      });
  }

  private cargarVariablesYProductos(draft: NaturalDraft) {
    this.ultimoDraft = draft;
    this.showLoading = true;
    this.productoService
      .GetAllAppVariableSearchAgrupado({ appSubCategoryId: this.subCategoria.id })
      .subscribe({
        next: (resp) => {
          this.variableGroups = resp?.data || [];
          this.variablesSeleccionadas = this.esSubcategoriaGeneral()
            ? []
            : this.resolverVariables(draft.productoTexto);
          this.buscarProductos(draft);
        },
        error: () => {
          this.showLoading = false;
          this.mensaje = 'No fue posible cargar las caracteristicas de la categoria';
        },
      });
  }

  getOpcionesVariable(group: any): AppVariableSearchGetDto[] {
    const rawOptions = group?.appVariableSearchGetDto;
    return Array.isArray(rawOptions) ? rawOptions : rawOptions ? [rawOptions] : [];
  }

  getVariableSeleccionada(group: any): AppVariableSearchGetDto {
    const appVariableId = Number(group?.appVariableId || 0);
    return (
      this.variablesSeleccionadas.find(
        (variable) => Number(variable.item.appVariableId) === appVariableId,
      )?.item || null
    );
  }

  onVariableManualChange(group: any, event) {
    const selected = event?.detail?.value as AppVariableSearchGetDto;
    if (!selected) {
      return;
    }

    this.variablesSeleccionadas = this.variablesSeleccionadas.filter(
      (variable) => Number(variable.item.appVariableId) !== Number(selected.appVariableId),
    );
    this.variablesSeleccionadas.push({
      variableDescription: group.variableDescription || selected.variableDescription,
      item: selected,
      score: 1,
    });

    this.productosCandidatos = [];
    this.appProduct = null;
    this.appProductConversionGetDto = null;
    this.precioMasFlete = 0;
    this.precioMaximoMasFlete = 0;
    this.form.patchValue({ precio: 0, total: 0, cantidad: 0, unidad: '', unidadId: 0 });

    this.buscarProductos(this.ultimoDraft || this.extraerDraft(this.textoNatural));
  }

  private resolverVariables(texto: string): MatchedVariable[] {
    const seleccionadas: MatchedVariable[] = [];

    for (const group of this.variableGroups) {
      const rawOptions = group.appVariableSearchGetDto;
      const options: AppVariableSearchGetDto[] = Array.isArray(rawOptions)
        ? rawOptions
        : rawOptions
        ? [rawOptions]
        : [];
      const best = this.bestVariableByText(options, texto);

      if (best && best.score >= 0.2) {
        seleccionadas.push({
          variableDescription: group.variableDescription,
          item: best.item,
          score: best.score,
        });
      }
    }

    return seleccionadas;
  }

  private buscarProductos(draft: NaturalDraft) {
    const buscarComoGeneral = this.esSubcategoriaGeneral() || !this.tieneCaracteristicasValidas();

    if (this.variablesSeleccionadas.length === 0 && !buscarComoGeneral) {
      this.showLoading = false;
      this.productosCandidatos = [];
      this.mensaje =
        'No detecte caracteristicas validas para la categoria. Ajuste el texto o seleccione otra categoria.';
      return;
    }

    const request =
      !buscarComoGeneral && this.variablesSeleccionadas.length > 0
        ? this.productoService.GetAllProductusByCriteria({
            filters: this.variablesSeleccionadas.map((item) => item.item),
            subcategoryId: this.subCategoria.id,
          })
        : this.buscarProductosVertical(this.getTextoBusquedaGeneral(draft));

    request.subscribe({
      next: (resp) => {
        this.productosCandidatos = resp?.data || [];
        if (this.productosCandidatos.length > 0) {
          this.showLoading = false;
          this.aplicarProductosEncontrados(draft, this.variablesSeleccionadas.length > 0);
          return;
        }

        if (this.getTextoBusquedaGeneral(draft) && buscarComoGeneral) {
          this.buscarProductosVertical('').subscribe({
            next: (fallbackResp) => {
              this.showLoading = false;
              this.productosCandidatos = fallbackResp?.data || [];
              this.aplicarProductosEncontrados(draft, false);
            },
            error: () => {
              this.showLoading = false;
              this.mensaje = 'No fue posible buscar productos de la categoria interpretada';
            },
          });
          return;
        }

        this.showLoading = false;
        this.aplicarProductosEncontrados(draft, false);
      },
      error: () => {
        this.showLoading = false;
        this.mensaje = 'No fue posible buscar productos con los criterios interpretados';
      },
    });
  }

  tieneCaracteristicasValidas(): boolean {
    if (this.esSubcategoriaGeneral()) {
      return false;
    }

    return (this.variableGroups || []).some(
      (group) => this.getOpcionesVariable(group).length > 0,
    );
  }

  esSubcategoriaGeneral(): boolean {
    return GENERAL_SUBCATEGORY_IDS.includes(Number(this.subCategoria?.id || 0));
  }

  private getTextoBusquedaGeneral(draft: NaturalDraft): string {
    const categoryText = this.normalize(this.subCategoria?.description || '');
    const categoryTokens = categoryText
      .split(' ')
      .filter((token) => token.length > 2);

    const generic = new Set([
      'producto',
      'productos',
      'product',
      'products',
      'office',
      'etiqueta',
      'etiquetas',
      ...categoryTokens,
    ]);

    return (draft.productoBusqueda || draft.productoTexto)
      .split(' ')
      .filter((token) => !generic.has(this.stemToken(token)))
      .join(' ')
      .trim();
  }

  onSubcategoriaManualChange(event) {
    const subCategoriaId = Number(event?.detail?.value || 0);
    this.subCategoria =
      this.subcategorias.find((item) => Number(item.id) === subCategoriaId) || null;
    this.variableGroups = [];
    this.variablesSeleccionadas = [];
    this.productosCandidatos = [];
    this.appProduct = null;
    this.appProductConversionGetDto = null;
    this.precioMasFlete = 0;
    this.precioMaximoMasFlete = 0;
    this.form.patchValue({ precio: 0, total: 0, cantidad: 0, unidad: '', unidadId: 0 });

    if (!this.subCategoria) {
      return;
    }

    const draft = this.extraerDraft(this.textoNatural);
    this.cargarVariablesYProductos(draft);
  }

  private buscarProductosVertical(searchText: string) {
    return this.productoService.GetAllVertical({
      pageSize: 20,
      pageNumber: 1,
      id: 0,
      code: '',
      description1: '',
      description2: '',
      searchText,
      subCategoria: this.subCategoria.id,
    });
  }

  private aplicarProductosEncontrados(draft: NaturalDraft, puedeAutoSeleccionar: boolean) {
    const best = this.bestByText(
      this.productosCandidatos,
      draft.productoBusqueda || draft.productoTexto,
      (item) =>
        `${item.code} ${item.externalCode} ${item.description1} ${
          item.description2
        } ${(item as any).variablesSearchText || ''}`,
    );

    if (
      puedeAutoSeleccionar &&
      (this.productosCandidatos.length === 1 || (best && best.score > 0.55))
    ) {
      this.seleccionarProducto(best?.item || this.productosCandidatos[0]);
    } else if (this.productosCandidatos.length > 0) {
      this.mensaje =
        this.variablesSeleccionadas.length > 0
          ? 'Productos filtrados por caracteristicas. Seleccione el producto correcto.'
          : 'Productos encontrados en la lista general. Seleccione el producto correcto.';
    } else {
      this.mensaje = 'No encontre productos con los criterios interpretados.';
    }
  }

  seleccionarProducto(producto: AppProductsGetDto, calcularPrecio = true) {
    this.appProduct = producto;
    this.appProductConversionGetDto = producto.conversiones?.[0] || null;
    this.form.get('unidad').setValue(
      this.appProductConversionGetDto?.appUnitsAlternativaDescription || '',
    );
    this.form.get('unidadId').setValue(
      this.appProductConversionGetDto?.appUnitsIdAlternativa || 0,
    );

    if (!calcularPrecio) {
      return;
    }

    if (this.esSubcategoriaGeneral()) {
      this.aplicarPrecioDesdeProductoGeneral(producto);
      return;
    }

    this.calcularPrecio();
  }

  private aplicarPrecioDesdeProductoGeneral(producto: AppProductsGetDto) {
    const cantidad = this.calculoConversionGenerico(
      this.appProductConversionGetDto,
      Number(this.form.get('cantidadSolicitada').value || 0),
    );
    const appPriceDto = ((producto as any).appPriceDto || []) as any[];
    const precioRango = this.buscarPrecioPorRango(appPriceDto, cantidad, 'precio');
    const precioMaximoRango = this.buscarPrecioPorRango(
      appPriceDto,
      cantidad,
      'precioMaximo',
    );

    this.form.get('cantidad').setValue(cantidad);
    this.unitPriceBaseProduction =
      precioRango || Number((producto as any).precioMasFlete || producto.unitPrice || 0);
    this.flete = Number(producto.flete || 0);
    this.precioMasFlete = this.unitPriceBaseProduction + this.flete;
    this.precioMaximoMasFlete =
      precioMaximoRango > 0 ? precioMaximoRango + this.flete : this.precioMasFlete;
    this.form.get('precio').setValue(Number(this.precioMasFlete).toFixed(2));
    this.form
      .get('total')
      .setValue(Number(this.precioMasFlete || 0) * Number(cantidad || 0));
    this.calculoId = 0;
    this.mensaje = '';
  }

  private buscarPrecioPorRango(
    appPriceDto: any[],
    cantidad: number,
    field: 'precio' | 'precioMaximo',
  ): number {
    if (!appPriceDto || appPriceDto.length === 0) {
      return 0;
    }

    const rango = appPriceDto.find(
      (item) =>
        Number(item.desde || 0) <= Number(cantidad || 0) &&
        Number(item.hasta || 0) >= Number(cantidad || 0),
    );
    return Number((rango || appPriceDto[0])?.[field] || 0);
  }

  seleccionarMunicipio(municipio: MunicipioGetDto) {
    this.municipio = municipio;
    this.form.patchValue({
      idMunicipio: municipio.recnum,
      descripcionMunicipio: municipio.descMunicipio,
    });
  }

  async abrirMunicipio() {
    const modal = await this.modalCtrl.create({
      component: BuscadorMunicipioComponent,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.itemMunicipio) {
      this.seleccionarMunicipio(data.itemMunicipio);
      this.recalcularResultado();
    }
  }

  recalcularResultado() {
    if (!this.appProduct) {
      return;
    }

    if (this.esSubcategoriaGeneral()) {
      this.aplicarPrecioDesdeProductoGeneral(this.appProduct);
      return;
    }

    this.calcularPrecio();
  }

  calcularPrecio() {
    if (!this.validarParaPrecio()) {
      return;
    }

    const requiereMedidas = this.requiereMedidas();
    const cantidad = this.calculoConversionGenerico(
      this.appProductConversionGetDto,
      Number(this.form.get('cantidadSolicitada').value || 0),
    );
    this.form.get('cantidad').setValue(cantidad);

    this.buscandoPrecio = true;
    this.mensaje = 'Buscando precio';
    this.productoService.getPrice(this.buildGetPricePayload(requiereMedidas)).subscribe({
      next: (resp) => {
        this.buscandoPrecio = false;
        this.aplicarResultadoPrecio(resp, cantidad);
      },
      error: () => {
        this.buscandoPrecio = false;
        this.mensaje = 'No fue posible calcular el precio';
      },
    });
  }

  private aplicarResultadoPrecio(resp: any, cantidadFallback: number) {
    const data = resp?.data;
    if (!data) {
      this.mensaje = 'No fue posible calcular el precio';
      return;
    }

    this.calculoId = data.calculoId ?? 0;
    this.unitPriceBaseProduction = data.precio ?? 0;
    this.flete = data.flete ?? 0;
    this.precioMasFlete =
      data.precioMasFlete ?? this.unitPriceBaseProduction + this.flete;
    this.precioMaximoMasFlete =
      data.precioMaximoMasFlete ?? (data.precioMaximo ?? 0) + this.flete;
    const cantidadConvertida = data.cantidadConvertida ?? cantidadFallback ?? 0;
    this.form.get('cantidad').setValue(cantidadConvertida);
    this.form.get('precio').setValue(Number(this.precioMasFlete).toFixed(2));
    this.form
      .get('total')
      .setValue(Number(this.form.get('precio').value || 0) * cantidadConvertida);
    this.mensaje = '';
  }

  private validarParaPrecio(): boolean {
    if (!this.appProduct) {
      this.mensaje = 'Seleccione un producto candidato';
      return false;
    }
    if (Number(this.form.get('idMunicipio').value || 0) <= 0) {
      this.mensaje = 'Seleccione municipio';
      return false;
    }
    if (Number(this.form.get('condicionPago').value || 0) <= 0) {
      this.mensaje = 'Seleccione condicion de pago';
      return false;
    }
    if (Number(this.form.get('cantidadSolicitada').value || 0) <= 0) {
      this.mensaje = 'Indique cantidad';
      return false;
    }
    if (
      this.requiereMedidas() &&
      (Number(this.form.get('medidaBasica').value || 0) <= 0 ||
        Number(this.form.get('medidaOpuesta').value || 0) <= 0)
    ) {
      this.mensaje = 'Indique medida basica y opuesta';
      return false;
    }
    return true;
  }

  private buildGetPricePayload(requiereMedidas: boolean): GetPriceQueryFilter {
    const unidadId =
      this.form.get('unidadId').value ||
      this.appProductConversionGetDto?.appUnitsIdAlternativa ||
      0;

    return {
      idMunicipio: Number(this.form.get('idMunicipio').value || 0),
      appProuctId: this.appProduct.id,
      cantidad: Number(this.form.get('cantidadSolicitada').value || 0),
      largo: requiereMedidas
        ? Number(this.form.get('medidaBasica').value || 0)
        : 0,
      ancho: requiereMedidas
        ? Number(this.form.get('medidaOpuesta').value || 0)
        : 0,
      unidadId,
      unidad: unidadId,
      condicionDePago: Number(this.form.get('condicionPago').value || 0),
    };
  }

  private requiereMedidas(): boolean {
    return [1, 4, 6].includes(Number(this.appProduct?.tipoCalculo || 0));
  }

  private calculoConversionGenerico(
    conversionDto: AppProductConversionGetDto,
    cantidad: number,
  ): number {
    if (!conversionDto) {
      return cantidad;
    }

    const conversion = new Conversion(
      conversionDto.xNumerador,
      conversionDto.yDenominador,
      cantidad,
    );
    return conversion.getCantidadAlternativa();
  }

  private extractMedidas(text: string): { basica: number; opuesta: number } {
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:x|por|\*)\s*(\d+(?:[.,]\d+)?)/);
    return {
      basica: match ? this.parseNumber(match[1]) : 0,
      opuesta: match ? this.parseNumber(match[2]) : 0,
    };
  }

  private extractCantidad(text: string): number {
    const withoutDimensions = text.replace(
      /(\d+(?:[.,]\d+)?)\s*(?:x|por|\*)\s*(\d+(?:[.,]\d+)?)/g,
      '',
    );
    const explicit = withoutDimensions.match(
      /(\d+(?:[.,]\d+)?)\s*(mil|millares|unidades|und|uds|piezas|etiquetas|cajas|ca)\b/,
    );
    if (explicit) {
      const value = this.parseNumber(explicit[1]);
      return explicit[2] === 'mil' || explicit[2] === 'millares'
        ? value * 1000
        : value;
    }
    const numbers = withoutDimensions.match(/\d+(?:[.,]\d+)?/g) || [];
    return numbers.length > 0 ? this.parseNumber(numbers[0]) : 0;
  }

  private extractAfter(text: string, tokens: string[]): string {
    for (const token of tokens) {
      const idx = text.indexOf(token);
      if (idx >= 0) {
        return text
          .slice(idx + token.length)
          .split(/,| con | pago | en und | en mil | de \d/)[0]
          .trim();
      }
    }
    return '';
  }

  private extractCondicionTexto(text: string): string {
    const match = text.match(/(?:pago|condicion|cond)\s+([^,]+)/);
    return match ? match[1].trim() : '';
  }

  private extractUnidadTexto(text: string): string {
    const match = text.match(/\b(und|unidad|unidades|mil|millar|caja|ca|rollo)\b/);
    return match ? match[1].trim() : '';
  }

  private extractProductoBusqueda(text: string): string {
    return text
      .replace(/(\d+(?:[.,]\d+)?)\s*(?:x|por|\*)\s*(\d+(?:[.,]\d+)?)(?:\s*(cm|mm|m))?/g, ' ')
      .replace(/\b\d+(?:[.,]\d+)?\b/g, ' ')
      .replace(/\b(cotizar|cotiza|precio|consultar|consulta|necesito|quiero|para|hacia|pago|condicion|cond|en|de)\b/g, ' ')
      .replace(/\b(anticipado|contado|credito|dias|dia|und|unidad|unidades|uds|mil|millar|millares|caja|cajas|ca|cm|mm|m)\b/g, ' ')
      .replace(/\b(caracas|libertador|municipio)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private bestByText<T>(
    items: T[],
    text: string,
    selector: (item: T) => string,
  ): { item: T; score: number } | null {
    const source = this.normalize(text);
    let best: { item: T; score: number } = null;

    for (const item of items || []) {
      const candidate = this.normalize(selector(item));
      const score = this.score(candidate, source);
      if (!best || score > best.score) {
        best = { item, score };
      }
    }

    return best;
  }

  private bestVariableByText(
    items: AppVariableSearchGetDto[],
    text: string,
  ): { item: AppVariableSearchGetDto; score: number } | null {
    const source = this.normalize(text);
    const codeMatch = this.bestVariableByTechnicalCode(items, source);
    if (codeMatch) {
      return codeMatch;
    }

    let best: { item: AppVariableSearchGetDto; score: number } = null;

    for (const item of items || []) {
      const candidate = this.normalize(item.searchText);
      const score = this.scoreVariable(candidate, source);
      if (!best || score > best.score) {
        best = { item, score };
      }
    }

    return best;
  }

  private bestVariableByTechnicalCode(
    items: AppVariableSearchGetDto[],
    source: string,
  ): { item: AppVariableSearchGetDto; score: number } | null {
    const sourceCodes = this.extractTechnicalCodes(source);
    if (sourceCodes.length === 0) {
      return null;
    }

    let best: { item: AppVariableSearchGetDto; score: number } = null;

    for (const item of items || []) {
      const candidateCodes = this.extractTechnicalCodes(this.normalize(item.searchText));
      const score = this.scoreTechnicalCodeLists(candidateCodes, sourceCodes);
      if (score > 0 && (!best || score > best.score)) {
        best = { item, score };
      }
    }

    return best;
  }

  private scoreVariable(candidate: string, source: string): number {
    if (!candidate || !source) {
      return 0;
    }

    const codeScore = this.scoreTechnicalCodes(candidate, source);
    if (codeScore > 0) {
      return codeScore;
    }

    const candidateTokens = this.removeGenericVariableTokens(this.expandCompoundTokens(candidate));
    const sourceTokens = this.expandCompoundTokens(source);
    const matched = candidateTokens.filter((token) =>
      sourceTokens.some((sourceToken) => this.tokensMatch(token, sourceToken)),
    );

    if (matched.length === 0) {
      return 0;
    }

    const directScore = matched.length / Math.max(candidateTokens.length, 1);
    const strongestSignal = matched.some((token) =>
      ['adhesiv', 'autoadhesiv', 'laminad', 'brill', 'mate', 'termic', 'transparente'].some(
        (signal) => this.tokensMatch(token, signal),
      ),
    );

    return strongestSignal ? Math.max(directScore, 0.25) : directScore;
  }

  private scoreTechnicalCodes(candidate: string, source: string): number {
    const candidateCodes = this.extractTechnicalCodes(candidate);
    const sourceCodes = this.extractTechnicalCodes(source);

    return this.scoreTechnicalCodeLists(candidateCodes, sourceCodes);
  }

  private scoreTechnicalCodeLists(candidateCodes: string[], sourceCodes: string[]): number {
    if (candidateCodes.length === 0 || sourceCodes.length === 0) {
      return 0;
    }

    for (const candidateCode of candidateCodes) {
      for (const sourceCode of sourceCodes) {
        if (candidateCode === sourceCode) {
          return 2;
        }

        if (
          sourceCode.length >= 5 &&
          (candidateCode.startsWith(sourceCode) || sourceCode.startsWith(candidateCode))
        ) {
          return 1.5;
        }
      }
    }

    return 0;
  }

  private extractTechnicalCodes(value: string): string[] {
    return (value || '')
      .split(' ')
      .map((token) => token.replace(/[^a-z0-9]/g, ''))
      .filter((token) => /^[a-z]{2,}\d+[a-z0-9]*$/.test(token));
  }

  private score(candidate: string, source: string): number {
    if (!candidate || !source) {
      return 0;
    }
    if (source.includes(candidate) || candidate.includes(source)) {
      return 1;
    }

    const candidateTokens = candidate.split(' ').filter((token) => token.length > 2);
    const sourceTokens = source.split(' ');
    const matched = candidateTokens.filter((token) =>
      sourceTokens.some((sourceToken) => this.tokensMatch(token, sourceToken)),
    );

    return candidateTokens.length ? matched.length / candidateTokens.length : 0;
  }

  private tokensMatch(candidate: string, source: string): boolean {
    if (candidate === source) {
      return true;
    }

    const candidateStem = this.stemToken(candidate);
    const sourceStem = this.stemToken(source);

    return (
      candidateStem === sourceStem ||
      (candidateStem.length >= 5 && sourceStem.includes(candidateStem)) ||
      (sourceStem.length >= 5 && candidateStem.includes(sourceStem))
    );
  }

  private expandCompoundTokens(value: string): string[] {
    return (value || '')
      .replace(/sinlaminado/g, 'sin laminado')
      .replace(/autoadhesivo/g, 'auto adhesivo autoadhesivo')
      .split(' ')
      .map((token) => this.stemToken(token))
      .filter((token) => token.length > 2);
  }

  private removeGenericVariableTokens(tokens: string[]): string[] {
    const generic = new Set([
      'papel',
      'polipropilen',
      'pp',
      'blanc',
      'laser',
      'jet',
      'transferenci',
      'direct',
    ]);

    const filtered = tokens.filter((token) => !generic.has(token) && !/^[a-z]+\d+[a-z]*$/.test(token));
    return filtered.length > 0 ? filtered : tokens;
  }

  private stemToken(token: string): string {
    let clean = token || '';

    if (clean.length > 5 && clean.endsWith('es')) {
      clean = clean.slice(0, -2);
    } else if (clean.length > 4 && clean.endsWith('s')) {
      clean = clean.slice(0, -1);
    }

    if (clean.length > 5 && (clean.endsWith('a') || clean.endsWith('o'))) {
      clean = clean.slice(0, -1);
    }

    return clean;
  }

  private normalize(value: string): string {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.,x*]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseNumber(value: string): number {
    const clean = (value || '').trim();
    if (clean.includes(',') && clean.includes('.')) {
      return Number(clean.replace(/\./g, '').replace(',', '.')) || 0;
    }
    if (clean.includes(',')) {
      return Number(clean.replace(',', '.')) || 0;
    }
    if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
      return Number(clean.replace(/\./g, '')) || 0;
    }
    return Number(clean) || 0;
  }
}
