import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { ConsultaPorRifService } from 'src/app/services/consulta-por-rif.service';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  ClienteBusquedaPorRif,
  ClientePorRifDto,
  CotizacionPorRifDto,
  EstadisticaPorRifDto,
  NumeracionFiscalPorRifDto,
} from 'src/app/models/consulta-por-rif-dto';

type SeccionExportable =
  | 'clientes'
  | 'estadisticas'
  | 'cotizaciones'
  | 'numeracionesFiscales';

interface ExportColumn<T> {
  header: string;
  value: (row: T) => any;
}

@Component({
  selector: 'app-consulta-por-rif',
  templateUrl: './consulta-por-rif.page.html',
  styleUrls: ['./consulta-por-rif.page.scss'],
})
export class ConsultaPorRifPage implements OnInit, OnDestroy {
  @Input() initialRif = '';
  @Input() autoSearch = false;
  @Input() modalMode = false;

  form: FormGroup;

  loading = false;
  consultaRealizada = false;
  error = '';

  sugerencias: ClienteBusquedaPorRif[] = [];
  buscandoSugerencias = false;
  mostrarSugerencias = false;
  private rifValueChangesSub?: Subscription;

  clientes: ClientePorRifDto[] = [];
  estadisticas: EstadisticaPorRifDto[] = [];
  cotizaciones: CotizacionPorRifDto[] = [];
  numeracionesFiscales: NumeracionFiscalPorRifDto[] = [];
  seccionesExpandidas = {
    clientes: true,
    estadisticas: true,
    cotizaciones: true,
    numeracionesFiscales: true,
  };
  ordenFiltros = {
    estadisticas: '',
    cotizaciones: '',
    numeracionesFiscales: '',
  };
  cotizacionFiltros = {
    estadisticas: '',
    cotizaciones: '',
    numeracionesFiscales: '',
  };

  constructor(
    private formBuilder: FormBuilder,
    private consultaPorRifService: ConsultaPorRifService,
    private generalService: GeneralService,
    private modalController: ModalController,
  ) {
    this.form = this.formBuilder.group({
      rif: [
        '',
        [Validators.required, Validators.pattern(/^[VJEGP]-\d{8}-\d$/i)],
      ],
    });
  }

  ngOnInit(): void {
    this.rifValueChangesSub = this.form
      .get('rif')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.buscarSugerencias(value));

    const rif = this.normalizarRif(this.initialRif);
    if (!rif) return;

    this.form.patchValue({ rif }, { emitEvent: false });
    if (this.autoSearch) {
      this.consultar();
    }
  }

  ngOnDestroy(): void {
    this.rifValueChangesSub?.unsubscribe();
  }

  private buscarSugerencias(texto: string): void {
    const valor = (texto || '').trim();
    if (valor.length < 2) {
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      return;
    }

    this.buscandoSugerencias = true;
    this.consultaPorRifService.searchClientes(valor).subscribe({
      next: (response) => {
        this.buscandoSugerencias = false;
        this.sugerencias = response?.isValid ? response?.data || [] : [];
        this.mostrarSugerencias = this.sugerencias.length > 0;
      },
      error: () => {
        this.buscandoSugerencias = false;
        this.sugerencias = [];
        this.mostrarSugerencias = false;
      },
    });
  }

  onRifFocus(): void {
    this.mostrarSugerencias = this.sugerencias.length > 0;
  }

  seleccionarSugerencia(item: ClienteBusquedaPorRif): void {
    this.mostrarSugerencias = false;
    this.sugerencias = [];
    this.form.patchValue({ rif: this.normalizarRif(item.rif) }, { emitEvent: false });
    this.consultar();
  }

  consultar(): void {
    this.mostrarSugerencias = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rif = this.normalizarRif(this.form.get('rif')?.value);

    this.loading = true;
    this.error = '';
    this.consultaRealizada = false;

    this.consultaPorRifService.getByRif(rif).subscribe({
      next: (response) => {
        this.loading = false;
        this.consultaRealizada = true;

        if (!response?.isValid) {
          this.error = response?.message || 'La consulta no fue valida.';
          this.limpiarResultados();
          return;
        }

        this.clientes = response?.data?.clientes || [];
        this.estadisticas = response?.data?.estadisticas || [];
        this.cotizaciones = response?.data?.cotizaciones || [];
        this.numeracionesFiscales = response?.data?.numeracionesFiscales || [];
      },
      error: (err) => {
        this.loading = false;
        this.consultaRealizada = true;
        this.limpiarResultados();

        this.error = err?.error?.message || 'Ocurrio un error consultando el RIF.';
        this.generalService.presentToast(this.error, 'danger');
      },
    });
  }

  onRifBlur(): void {
    const rif = this.normalizarRif(this.form.get('rif')?.value);
    this.form.patchValue({ rif }, { emitEvent: false });
    setTimeout(() => (this.mostrarSugerencias = false), 150);
  }

  cerrarModal(): void {
    this.modalController.dismiss();
  }

  private limpiarResultados(): void {
    this.clientes = [];
    this.estadisticas = [];
    this.cotizaciones = [];
    this.numeracionesFiscales = [];
  }

  private normalizarRif(value: string): string {
    return (value || '').trim().toUpperCase();
  }

  toggleSeccion(seccion: keyof typeof this.seccionesExpandidas): void {
    this.seccionesExpandidas[seccion] = !this.seccionesExpandidas[seccion];
  }

  onFiltroOrdenChange(
    seccion: keyof typeof this.ordenFiltros,
    value: any,
  ): void {
    this.ordenFiltros[seccion] = (value || '').toString().trim();
  }

  get estadisticasFiltradas(): EstadisticaPorRifDto[] {
    return this.filtrarPorOrdenYCotizacion(
      this.estadisticas,
      this.ordenFiltros.estadisticas,
      this.cotizacionFiltros.estadisticas,
      (row) => row.orden,
      (row) => row.cotizacion,
    );
  }

  get cotizacionesFiltradas(): CotizacionPorRifDto[] {
    return this.filtrarPorOrdenYCotizacion(
      this.cotizaciones,
      this.ordenFiltros.cotizaciones,
      this.cotizacionFiltros.cotizaciones,
      (row) => row.orden,
      (row) => row.cotizacion,
    );
  }

  get numeracionesFiscalesFiltradas(): NumeracionFiscalPorRifDto[] {
    return this.filtrarPorOrdenYCotizacion(
      this.numeracionesFiscales,
      this.ordenFiltros.numeracionesFiscales,
      this.cotizacionFiltros.numeracionesFiscales,
      (row) => row.orden,
      (row) => row.cotizacion,
    );
  }

  exportarCsv(seccion: SeccionExportable): void {
    const config = this.getExportConfig(seccion);
    if (!config.rows.length) {
      this.generalService.presentToast('No hay datos para exportar.', 'warning');
      return;
    }

    const csvContent = this.buildCsv(config.rows, config.columns);
    this.downloadFile(
      csvContent,
      `consulta_por_rif_${seccion}_${this.getTimestamp()}.csv`,
      'text/csv;charset=utf-8;',
    );
  }

  exportarExcel(seccion: SeccionExportable): void {
    const config = this.getExportConfig(seccion);
    if (!config.rows.length) {
      this.generalService.presentToast('No hay datos para exportar.', 'warning');
      return;
    }

    const htmlTable = this.buildExcelTable(config.rows, config.columns);
    this.downloadFile(
      htmlTable,
      `consulta_por_rif_${seccion}_${this.getTimestamp()}.xls`,
      'application/vnd.ms-excel;charset=utf-8;',
    );
  }

  private getExportConfig(
    seccion: SeccionExportable,
  ): { rows: any[]; columns: ExportColumn<any>[] } {
    if (seccion === 'clientes') {
      return {
        rows: this.clientes,
        columns: [
          { header: 'Codigo', value: (r) => r.codigo },
          { header: 'Nombre', value: (r) => r.nombre },
          { header: 'Vendedor 1', value: (r) => r.vendedor1 },
          { header: 'Nombre Vendedor', value: (r) => r.nombreVendedor },
          {
            header: 'Fecha Apertura',
            value: (r) => this.formatDate(r.fechaApertura),
          },
          {
            header: 'Fecha Ultima Factura',
            value: (r) => this.formatDate(r.fechaUltimaFactura),
          },
          {
            header: 'Fecha Modificacion',
            value: (r) => this.formatDate(r.fechaModificacion, true),
          },
          { header: 'Flag Inactivo', value: (r) => (r.flagInactivo || '').trim() },
          { header: 'Oficina', value: (r) => r.oficina },
          { header: 'Flag Atendido', value: (r) => (r.flagAtendido || '').trim() },
        ],
      };
    }

    if (seccion === 'estadisticas') {
      return {
        rows: this.estadisticasFiltradas,
        columns: [
          { header: 'Nombre', value: (r) => r.nombre },
          { header: 'Cliente', value: (r) => r.cliente },
          { header: 'Cotizacion', value: (r) => r.cotizacion },
          { header: 'Orden', value: (r) => r.orden },
          { header: 'Anio', value: (r) => r.anio },
          { header: 'Mes', value: (r) => r.mes },
          { header: 'Nombre Vendedor', value: (r) => r.nombreVendedor },
          { header: 'Nombre Producto', value: (r) => r.nombreProducto },
          { header: 'Millares P', value: (r) => r.millaresP },
          { header: 'Venta Dol Ref', value: (r) => r.ventaDolRef },
          { header: 'Fiscal', value: (r) => r.fiscal },
        ],
      };
    }

    if (seccion === 'cotizaciones') {
      return {
        rows: this.cotizacionesFiltradas,
        columns: [
          { header: 'Cotizacion', value: (r) => r.cotizacion },
          { header: 'Cliente', value: (r) => r.cliente },
          { header: 'Anio', value: (r) => r.anio },
          { header: 'Mes', value: (r) => r.mes },
          { header: 'Sub Categoria', value: (r) => r.subCategoria },
          { header: 'Producto', value: (r) => r.producto },
          { header: 'Vendedor', value: (r) => r.vendedor },
          { header: 'Descripcion', value: (r) => r.descripcion },
          { header: 'Motivo', value: (r) => r.motivo },
          { header: 'Orden', value: (r) => r.orden },
          { header: 'Total Propuesta USD', value: (r) => r.totalPropuestaUsd },
        ],
      };
    }

    return {
      rows: this.numeracionesFiscalesFiltradas,
      columns: [
        { header: 'Id Numeracion', value: (r) => r.idNumeracion },
        { header: 'RIF', value: (r) => r.rif },
        { header: 'Cotizacion', value: (r) => r.cotizacion },
        { header: 'Orden', value: (r) => r.orden },
        { header: 'Copy', value: (r) => r.copy },
        {
          header: 'Serie Control Desde',
          value: (r) => (r.numeroSerieControlDesde || '').trim(),
        },
        {
          header: 'Control Desde',
          value: (r) => (r.numeroControlDesde || '').trim(),
        },
        {
          header: 'Serie Control Hasta',
          value: (r) => (r.numeroSerieControlHasta || '').trim(),
        },
        {
          header: 'Control Hasta',
          value: (r) => (r.numeroControlHasta || '').trim(),
        },
        {
          header: 'Serie Formato Desde',
          value: (r) => (r.numeroSerieFormatoDesde || '').trim(),
        },
        {
          header: 'Formato Desde',
          value: (r) => (r.numeroFormatoDesde || '').trim(),
        },
        {
          header: 'Serie Formato Hasta',
          value: (r) => (r.numeroSerieFormatoHasta || '').trim(),
        },
        {
          header: 'Formato Hasta',
          value: (r) => (r.numeroFormatoHasta || '').trim(),
        },
        { header: 'Tipo Documento', value: (r) => r.tipoDocumento },
        { header: 'Longitud Mascara', value: (r) => r.longitudMascara },
        {
          header: 'Longitud Mascara Formato',
          value: (r) => r.longitudMascaraFormato,
        },
        { header: 'Usuario Agrega', value: (r) => r.usuarioAgrega },
        {
          header: 'Fecha Agrega',
          value: (r) => this.formatDate(r.fechaAgrega, true),
        },
      ],
    };
  }

  private buildCsv(rows: any[], columns: ExportColumn<any>[]): string {
    const headers = columns.map((c) => this.escapeCsv(c.header)).join(',');
    const lines = rows.map((row) =>
      columns
        .map((c) => this.escapeCsv(this.toDisplayValue(c.value(row))))
        .join(','),
    );
    return [headers, ...lines].join('\n');
  }

  private buildExcelTable(rows: any[], columns: ExportColumn<any>[]): string {
    const headers = columns.map((c) => `<th>${this.escapeHtml(c.header)}</th>`).join('');
    const body = rows
      .map((row) => {
        const cells = columns
          .map((c) => `<td>${this.escapeHtml(this.toDisplayValue(c.value(row)))}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>${headers}</tr>
            </thead>
            <tbody>
              ${body}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  private downloadFile(content: string, fileName: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  private escapeCsv(value: string): string {
    const normalized = (value ?? '').toString().replace(/"/g, '""');
    return `"${normalized}"`;
  }

  private escapeHtml(value: string): string {
    return (value ?? '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private toDisplayValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return value.toString();
  }

  private filtrarPorOrdenYCotizacion<T>(
    rows: T[],
    filtroOrden: string,
    filtroCotizacion: string,
    getOrden: (row: T) => any,
    getCotizacion: (row: T) => any,
  ): T[] {
    const ordenTerm = (filtroOrden || '').trim();
    const cotizacionTerm = (filtroCotizacion || '').trim().toLowerCase();

    if (!ordenTerm && !cotizacionTerm) {
      return rows;
    }

    return rows.filter((row) => {
      let cumpleOrden = true;
      let cumpleCotizacion = true;

      if (ordenTerm) {
        const orden = getOrden(row);
        cumpleOrden =
          orden !== null &&
          orden !== undefined &&
          orden.toString().includes(ordenTerm);
      }

      if (cotizacionTerm) {
        const cotizacion = getCotizacion(row);
        cumpleCotizacion =
          cotizacion !== null &&
          cotizacion !== undefined &&
          cotizacion
            .toString()
            .toLowerCase()
            .includes(cotizacionTerm);
      }

      return cumpleOrden && cumpleCotizacion;
    });
  }

  private formatDate(value: string | null, withTime = false): string {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    if (withTime) {
      return date.toLocaleString('es-VE');
    }

    return date.toLocaleDateString('es-VE');
  }

  private getTimestamp(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}${m}${day}_${hh}${mm}${ss}`;
  }
}
