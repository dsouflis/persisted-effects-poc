# PersistedEffectsPoc

This project showcases a few RxJS _stateful_ operators
used in an Effects-like class that relies on an external
service for persistence. For this reason, this is not a
real Effects class, because it needs asynchronous 
initialization. It uses a stand-in for Ionic Preferences
that wraps localStorage inside an async API.
In a use case that uses localStorage directly, 
the class can be modified
to remove the asynchrony, and be instantiated like all
other Effects classes.

It was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.0.

## Development server

Nothing useful there. But you can run `ng serve` to launch a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

If you wish to experiment and add functionality,
run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
This tests the Effects.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
