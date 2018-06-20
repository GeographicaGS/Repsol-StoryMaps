import { Component, OnInit, OnDestroy, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit, OnDestroy {

  @ViewChild('svg') svg;
  @ViewChild('cursor') cursor;
  date: Date;
  private _data;
  private needRedraw = false;

  @Input() set data(data) {
    if (data && data.length > 0) {
      this.needRedraw = true;
      this._data = data;
      this.draw(data);
    }
  }
  get data() {
    return this._data;
  }

  @Input()
  set observableDate(observable) {
    this.subscription = observable.subscribe((data) => {
      this.date = data.start;
      this.ref.detectChanges();
      this.draw(this.data);
      this.moveCursor();
    });
  }

  subscription: Subscription;

  constructor(
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  private draw(data) {
    if (this.needRedraw && this.date) {
      this.needRedraw = false;
      const svg = d3.select(this.svg.nativeElement),
      height = this.svg.nativeElement.getBoundingClientRect().height,
      width = this.svg.nativeElement.getBoundingClientRect().width;

      svg.selectAll('*').remove();
      const g = svg.append('g');

      for (const d of data) {
        d.value = d.cost_diesel + d.cost_gasoline + d.cost_shop + d.cost_wash;
      }
      const x = d3.scaleBand().padding(0.2)
        .domain(data.map((d)  => d.start))
        .rangeRound([0, width]),
        y = d3.scaleLinear()
          .domain([0, d3.max(data, (d) => d.value)])
          .range([height, 0])
        ;

      g.selectAll('bar')
        .data(data)
      .enter().append('rect')
        .attr('x', (d) => x(d.start) )
        .attr('width', x.bandwidth())
        .attr('y', (d) => height)
        .attr('height', 0)
        .attr('date', (d) => d.start)
        .transition()
        .duration(250)
        .delay((d, i) => i * 10)
        .attr('y', (d) => y(d.value))
        .attr('height', (d) => height - y(d.value))
        ;
    }
  }

  private moveCursor() {
    const svg = d3.select(this.svg.nativeElement),
    rect = svg.select(`rect[date="${this.date}"]`);
    if (rect._groups && rect._groups.length > 0 && rect._groups[0] && rect._groups[0].length > 0) {

      const translateX = this.svg.nativeElement.getBoundingClientRect().left -
                          this.svg.nativeElement.parentElement.getBoundingClientRect().left +
                          parseFloat(rect._groups[0][0].getAttribute('x')) +
                          Math.floor(rect._groups[0][0].getBoundingClientRect().width / 2);

      d3.select(this.cursor.nativeElement).style(
        'transform', `translateX(${translateX}px)`
      ).style('opacity', 1)
      ;
    }
    // this.svg.nativeElement.getBoundingClientRect().left - this.svg.nativeElement.parentElement.getBoundingClientRect().left
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
