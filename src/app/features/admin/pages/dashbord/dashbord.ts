import { Component } from '@angular/core';
import { Sidebar } from "../../components/sidebar/sidebar";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-dashbord',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './dashbord.html',
})
export class Dashbord {

}
