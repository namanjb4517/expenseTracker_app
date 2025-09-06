import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss'],
})
export class CircleProgressComponent  implements OnInit {
  @Input() percent: number = 0;
  @Input() radius: number = 80;
  @Input() stroke: number = 12;
  @Input() color: string = '#4CAF50';
  @Input() bgColor: string = '#f4f4f4';
  constructor() { }

  ngOnInit() {}

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    return this.circumference - (this.percent / 100) * this.circumference;
  }

}
