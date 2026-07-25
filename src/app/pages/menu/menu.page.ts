/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../../services/general.service';

import { IUsuario } from '../../interfaces/iusuario';
import { HttpClient } from '@angular/common/http';
import { PageMenu } from '../../models/page-menu-dto';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  pagesAll = [
    {
      id: 3,
      role: 387,
      title: 'Main',
      url: '/menu/main',
      icon: 'home',
      children: [],
    },
    {
      id: 4,
      role: 387,
      title: 'Cobranzas',
      url: '',
      icon: '',
      children: [
        {
          id: 4,
          title: 'Cobranzas',
          url: '/menu/general-cobranza-list',
          icon: 'cash-outline',
          pageMenuId: 4,
        },
        {
          id: 5,
          title: 'Verificar Pago',
          url: '/menu/verificar-pago',
          icon: 'checkmark-outline',
          pageMenuId: 4,
        },
        {
          id: 6,
          title: 'Aprobar Cobranza',
          url: '/menu/aprobar-cobranza',
          icon: 'checkmark-done-outline',
          pageMenuId: 4,
        },
      ],
    },
    {
      id: 9,
      role: 387,
      title: 'Cotizaciones',
      url: '',
      icon: '',
      children: [
        {
          id: 12,
          title: 'Cotizaciones',
          url: '/menu/cotizaciones-list',
          icon: 'cash-outline',
          pageMenuId: 9,
        },
        {
          id: 23,
          title: 'Aprobación de Precios',
          url: '/menu/solicitud-aprobacion-precios',
          icon: 'shield-checkmark-outline',
          pageMenuId: 9,
        },
        {
          id: 24,
          title: 'Aprobadores',
          url: '/menu/solicitud-aprobadores',
          icon: 'people-outline',
          pageMenuId: 9,
        },
        {
          id: 20,
          title: 'Calculadora de Precios',
          url: '/menu/search',
          icon: 'cart-outline',
          pageMenuId: 9,
        },
        {
          id: 25,
          title: 'Consulta Natural de Precios',
          url: '/menu/search-natural',
          icon: 'sparkles-outline',
          pageMenuId: 9,
        },
        {
          id: 21,
          title: 'Saldo Productos',
          url: '/menu/search-existencia',
          icon: 'cart-outline',
          pageMenuId: 9,
        },
        {
          id: 22,
          title: 'Consulta por RIF',
          url: '/menu/consulta-por-rif',
          icon: 'search-outline',
          pageMenuId: 9,
        },
      ],
    },
    {
      id: 10,
      role: 387,
      title: 'Maestros',
      url: '',
      icon: '',
      children: [
        {
          id: 13,
          title: 'Productos',
          url: '/menu/productos-list',
          icon: 'cart-outline',
          pageMenuId: 10,
        },
        {
          id: 14,
          title: 'Variables',
          url: '/menu/variables',
          icon: 'aperture-outline',
          pageMenuId: 10,
        },
        {
          id: 15,
          title: 'Ingredientes',
          url: '/menu/ingredientes-list',
          icon: 'list-outline',
          pageMenuId: 10,
        },
        {
          id: 16,
          title: 'Configuracion',
          url: '/menu/configuracion-list',
          icon: 'settings-outline',
          pageMenuId: 10,
        },
        {
          id: 17,
          title: 'Conversion Unidades',
          url: '/menu/template-conversion-unit-list',
          icon: 'contract-outline',
          pageMenuId: 10,
        },
      ],
    },
  ];
  role: number;
  usuario: IUsuario;
  pageData: any;

  pages: PageMenu[] = [];
  pageMenu: PageMenu[] = [];

  constructor(public ge: GeneralService, public http: HttpClient) {}

  async ngOnInit() {
    this.usuario = this.ge.GetUsuario();
    this.pages = this.pageMenu;
  }

  ionViewDidEnter() {
    this.usuario = this.ge.GetUsuario();
    this.pageMenu = JSON.parse(localStorage.getItem('menu'));
    this.pages = this.pageMenu;

    console.log('pages despues de filtrar', this.pages);
  }

  async readMenuFromJsonToAssetFolder() {
    this.http.get('../../../assets/json/pages.json').subscribe((data: any) => {
      this.pages = data;
    });
  }

  openChatbot() {
    window.open(
      'https://www.chatbase.co/chatbot-iframe/LM9jhFX6QHSv3KdpBnEpO',
      '_blank',
      'noopener,noreferrer'
    );
  }
}
