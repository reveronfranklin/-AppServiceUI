import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

interface ReglaFuncionalSection {
  titulo: string;
  reglas: string[];
}

@Component({
  selector: 'app-documentacion-funcional-detalle-cotizacion',
  templateUrl: './documentacion-funcional-detalle-cotizacion.component.html',
  styleUrls: ['./documentacion-funcional-detalle-cotizacion.component.scss'],
})
export class DocumentacionFuncionalDetalleCotizacionComponent {
  readonly secciones: ReglaFuncionalSection[] = [
    {
      titulo: 'Modo crear y modo editar',
      reglas: [
        'La pantalla muestra el formulario y la lista de productos de la cotizacion en una sola vista.',
        'Si la cotizacion tiene productos, carga automaticamente el primer registro en modo edicion.',
        'Si la cotizacion no tiene productos, inicia un detalle nuevo sin producto, unidad ni precio, con estatus de aprobacion aprobado por defecto.',
        'Al editar desde la lista, se cargan producto, unidad, cantidad, precio, observaciones, medidas, condicion de pago, flete, estatus de aprobacion y datos de conversion.',
        'Una cotizacion puede tener como maximo 5 productos; al llegar al limite no se permite iniciar ni guardar otro producto.',
        'Si el detalle tiene estatus mayor o igual a 5, se considera ganado o no modificable y no debe disparar aprobacion ni recalculo normal de precio.',
        'La moneda operativa de la pantalla queda forzada a dolares.',
      ],
    },
    {
      titulo: 'Producto, subcategoria y unidad',
      reglas: [
        'Al cambiar la subcategoria se limpian producto, descripcion, nombre comercial, unidad, conversion e identificadores internos.',
        'Al seleccionar producto se cargan sus datos maestros, conversion por defecto, precios por rango y si requiere datos de entrada.',
        'Si el producto no requiere datos de entrada, las medidas basica y opuesta se fijan en cero.',
        'Al seleccionar una unidad distinta, el precio en USD se reinicia en cero y se dispara un recalculo diferido.',
      ],
    },
    {
      titulo: 'Cantidades y conversiones',
      reglas: [
        'La cantidad solicitada representa la cantidad comercial indicada por el usuario.',
        'La cantidad convertida se usa para calculo y totalizacion.',
        'Para conversion generica se usa la relacion numerador sobre denominador.',
        'Para productos con largo y ancho se calcula con parametros de maquina; si no existen, se usan valores por defecto.',
        'Para tipo de calculo 4 con unidad 615, la cantidad se fuerza a cantidad solicitada dividida entre 1000.',
      ],
    },
    {
      titulo: 'Calculo de precios',
      reglas: [
        'La pantalla usa el precio base con flete como referencia para comparar contra el precio de venta.',
        'Ese precio base con flete corresponde al valor visible en la alerta de estimacion y se calcula internamente como newPrecioMasFlete.',
        'El precio base se compone normalmente de precio base de produccion mas flete.',
        'El flete se calcula como porcentaje sobre el precio base de produccion.',
        'Para rangos locales, el precio se toma del primer rango donde la cantidad este entre desde y hasta; si no hay coincidencia, se usa el primer precio disponible.',
      ],
    },
    {
      titulo: 'Aprobacion por precio',
      reglas: [
        'Se requiere aprobacion cuando el precio de venta esta por debajo del precio base con flete.',
        'Tambien se requiere aprobacion cuando el producto requiere estimacion o la API indica cantidad minima incumplida.',
        'Cuando requiere aprobacion, se activa la solicitud de precio y la barra cambia a estado de alerta.',
        'Para guardar con aprobacion de precio se exige observacion.',
        'Si el producto requiere estimacion, la observacion se envia con el prefijo de solicitud de estimacion.',
      ],
    },
    {
      titulo: 'Sobre margen y sobreprecio',
      reglas: [
        'La concesion compara el precio base con flete contra el precio de venta.',
        'Si la concesion es negativa, se interpreta como sobre margen.',
        'Si la concesion es positiva, se interpreta como descuento.',
        'Se permite enviar aprobacion por sobreprecio solo cuando el sobre margen supera el maximo configurado para el producto.',
        'En productos cotizados por GetPrice el maximo viene de GetPrice; en productos generales viene del rango activo de la lista de precios del producto.',
        'Para enviar aprobacion por sobreprecio se exige detalle guardado, observacion y codigo externo del producto.',
        'Antes de enviar la aprobacion por sobreprecio, la pantalla guarda el detalle actualizado.',
      ],
    },
    {
      titulo: 'Validaciones al guardar',
      reglas: [
        'Los dias de entrega deben ser mayores que cero.',
        'Para tipos de calculo 1 y 4, las medidas basica y opuesta deben ser mayores que cero.',
        'Si requiere aprobacion de precio, la observacion de solicitud es obligatoria.',
        'Para subcategoria 9 se exige salida, forma y presentacion con longitud mayor a 5 caracteres.',
        'Si existe precio aprobado, el precio de venta no puede ser menor a ese valor.',
      ],
    },
    {
      titulo: 'Guardado y actualizacion',
      reglas: [
        'En insercion, el detalle se crea con estatus 1.',
        'En insercion y actualizacion se envian producto, unidad, cantidades, precios, totales, observaciones, medidas, calculo, precio maximo y usuario conectado.',
        'Si la API devuelve mensaje de solicitud de precio, se muestra una alerta indicando que la cotizacion fue enviada para aprobacion.',
        'Si la operacion es exitosa, se actualiza la cotizacion y se refresca la lista de productos en la misma pantalla.',
        'Al eliminar un producto se carga el primer producto restante; si no queda ninguno, el formulario queda listo para crear.',
      ],
    },
  ];

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
