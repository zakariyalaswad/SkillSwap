import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../../components/header/header";

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './home.html',
})
export class Home {
  

}
