import {Component} from '@angular/core';
import {CycleTimeScatterplotComponent} from "../cycle-time-scatterplot/cycle-time-scatterplot.component";

@Component({
  selector: 'app-cycle-time',
  standalone: true,
  imports: [
    CycleTimeScatterplotComponent
  ],
  templateUrl: './cycle-time.page.html',
  styleUrl: './cycle-time.page.scss'
})
export class CycleTimePage {

}
