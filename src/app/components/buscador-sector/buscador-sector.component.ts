import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { MunicipioGetDto } from '../../models/municipio-get-dto';
import { MunicipioQueryFilter } from '../../interfaces/municipio-query-filter';
import { MtrSectorDto } from 'src/app/models/mtr-sector-dto';
import { GeneralService } from 'src/app/services/general.service';
import { IUsuario } from 'src/app/interfaces/iusuario';

@Component({
  selector: 'app-buscador-sector',
  templateUrl: './buscador-sector.component.html',
  styleUrls: ['./buscador-sector.component.scss'],
})
export class BuscadorSectorComponent implements OnInit {
  usuario: IUsuario;
  listAllSectores: MtrSectorDto[] = [];
  listSectores: MtrSectorDto[] = [];
  itemSector: MtrSectorDto;


  constructor(private modalCtrl: ModalController, private router: Router,
    private clienteService: ClienteService,  private gs: GeneralService,) { }

  ngOnInit() {

    this.usuario = this.gs.GetUsuario();
    const filter = {
      usuario: this.usuario.user,
      pageNumber: 1,
      pageSize: 100,
      searchText: ''
    };
    this.clienteService.listSectores(filter).subscribe(resp => {
      this.listAllSectores = resp.data;
      this.listSectores = resp.data;
      console.log(this.listSectores);
    });


  }



  refresh(searchText: string) {


    this.listSectores = this.listAllSectores.filter(item=>item.descripcionSector.toLowerCase().includes(searchText.toLowerCase()));

  }

  onChangeSearchText(event) {
    console.log('Busqueda de Sectores', event.target.value);
    const searchText = event.target.value;
    this.refresh(searchText);
  }

  selectSector(item: MtrSectorDto) {

    this.modalCtrl.dismiss({
      itemSector: item,

    });

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
