import { Component, OnInit, Output, OnDestroy, ViewChild, Input, ChangeDetectorRef, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs/Subscription';
import { CounterDuration, CounterStep } from '../..';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit, OnDestroy {

  @ViewChild('svg') svg;
  @ViewChild('cursor') cursor;
  @ViewChild('tooltip') tooltip;
  @Output() frameSelected = new EventEmitter<number>();
  @Output() paused = new EventEmitter<boolean>();
  counterDuration = CounterDuration;
  counterStep = CounterStep;
  date: Date;
  currentData = 0;
  pause = false;
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
      this.currentData = this.getTotalValue(data);
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
        d.value = this.getTotalValue(d);
      }
      const x = d3.scaleBand().padding(0.2)
        .domain(data.map((d)  => d.start))
        .rangeRound([0, width]),
        y = d3.scaleLinear()
          .domain([0, d3.max(data, (d) => d.value)])
          .range([height, 0])
        ;

      const xAxis = d3.axisBottom(x)
      .tickValues(this.getTicksValues(data))
      .tickFormat((d) => {
        return d3.timeFormat('%d %b')(new Date(d));
      })
      // .tickSize(10)
      // .tickPadding(5)
      // .tickFormat(d3.time.format('%Y-%m'))
      ;

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        // .style('text-anchor', 'end')
        // .attr('transform', 'rotate(-90)' )
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
        g.selectAll('bar')
          .data(data)
        .enter().append('rect')
          .classed('interactive', true)
          .attr('x', (d) => x(d.start) )
          .attr('width', x.bandwidth())
          .attr('y', 0)
          .attr('height', height)
          .attr('date', (d) => d.start)
          .on('click', (d) => {
            this.frameSelected.emit(d.time_seq);
          })
          ;
    }
  }

  private moveCursor() {
    const svg = d3.select(this.svg.nativeElement),
    cursor = d3.select(this.cursor.nativeElement),
    tooltip = d3.select(this.tooltip.nativeElement),
    rect = svg.select(`rect[date="${this.date}"]`);
    if (rect._groups && rect._groups.length > 0 && rect._groups[0] && rect._groups[0].length > 0) {

      const translateX = this.svg.nativeElement.getBoundingClientRect().left -
                          this.svg.nativeElement.parentElement.getBoundingClientRect().left +
                          parseFloat(rect._groups[0][0].getAttribute('x')) +
                          Math.floor(rect._groups[0][0].getBoundingClientRect().width / 2)
                          ;

      cursor.style(
        'transform', `translateX(${translateX - Math.floor(cursor._groups[0][0].getBoundingClientRect().width / 2)}px)`
      ).style('opacity', 1)
      ;

      tooltip.style(
        'transform', `translateX(${translateX - Math.floor(tooltip._groups[0][0].getBoundingClientRect().width / 2)}px)`
      ).style('opacity', 1)
      ;
    }
  }

  private getTicksValues(data) {
    const result = new Set();
    for (const d of data) {
      const date = new Date(d.start);
      date.setUTCHours(0);
      date.setUTCMinutes(0);
      date.setUTCSeconds(0);
      result.add(date.toISOString().split('.')[0] + 'Z');
    }
    return  Array.from(result).map(r => new Date(r));
  }

  private getTotalValue (data) {
    return data.cost_diesel + data.cost_gasoline + data.cost_shop + data.cost_wash;
  }

  togglePause() {
    this.pause = !this.pause;
    this.paused.emit(this.pause);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
