import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { signInWithRedirect, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // La caja que mira la plantilla. Empieza en false: sin sesion, no eres nadie.
  protected readonly esBibliotecario = signal(false);

  constructor() {
    this.revisarGrupos();

    Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect' || payload.event === 'signedOut') {
        this.revisarGrupos();
      }
    });
  }

  private async revisarGrupos() {
    const { tokens } = await fetchAuthSession();
    const grupos = (tokens?.accessToken?.payload['cognito:groups'] ?? []) as string[];
    this.esBibliotecario.set(grupos.includes('bibliotecarios'));
  }

  protected async entrar() {
    await signInWithRedirect();
  }
}
