import { Component, OnInit ,Input} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { MunicipioGetDto } from '../../models/municipio-get-dto';
import { MunicipioQueryFilter } from '../../interfaces/municipio-query-filter';
import { MtrSectorDto } from 'src/app/models/mtr-sector-dto';
import { GeneralService } from 'src/app/services/general.service';
import { IUsuario } from 'src/app/interfaces/iusuario';
import { MtrRamoDto } from 'src/app/models/mtr-ramo-dto';

@Component({
  selector: 'app-buscador-ramo',
  templateUrl: './buscador-ramo.component.html',
  styleUrls: ['./buscador-ramo.component.scss'],
})
export class BuscadorRamoComponent implements OnInit {
  @Input() listAllRamos: MtrRamoDto[];
  usuario: IUsuario;

  listRamos: MtrRamoDto[] = [];
  itemRamo: MtrRamoDto;


  constructor(private modalCtrl: ModalController, private router: Router,
    private clienteService: ClienteService,  private gs: GeneralService,) { }

  ngOnInit() {

    this.usuario = this.gs.GetUsuario();
    this.listRamos=this.listAllRamos;

  }



  refresh(searchText: string) {

    console.log('lista de ramos recibidos',this.listAllRamos);
    this.listRamos = this.listAllRamos.filter(item=>item.descripcionRamo.toLowerCase().includes(searchText.toLowerCase()));

  }

  onChangeSearchText(event) {
    console.log('Busqueda de Sectores', event.target.value);
    const searchText = event.target.value;
    this.refresh(searchText);
  }

  selectRamo(item: MtrRamoDto) {

    this.modalCtrl.dismiss({
      itemRamo: item,

    });

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
