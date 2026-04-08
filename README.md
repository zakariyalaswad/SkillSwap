# SkillSwap

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.14.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Project Structure

```
SkillSwap # 
├── .angular # 
│   └── cache # 
│       └── 20.3.15 # 
│           └── SkillSwap # 
│               ├── vite # 
│               │   ├── deps # 
│               │   │   ├── _metadata.json # 
│               │   │   ├── @angular_common.js # 
│               │   │   ├── @angular_common.js.map # 
│               │   │   ├── @angular_core.js # 
│               │   │   ├── @angular_core.js.map # 
│               │   │   ├── @angular_fire_app.js # 
│               │   │   ├── @angular_fire_app.js.map # 
│               │   │   ├── @angular_fire_auth.js # 
│               │   │   ├── @angular_fire_auth.js.map # 
│               │   │   ├── @angular_fire_firestore.js # 
│               │   │   ├── @angular_fire_firestore.js.map # 
│               │   │   ├── @angular_forms.js # 
│               │   │   ├── @angular_forms.js.map # 
│               │   │   ├── @angular_platform-browser.js # 
│               │   │   ├── @angular_platform-browser.js.map # 
│               │   │   ├── @angular_router.js # 
│               │   │   ├── @angular_router.js.map # 
│               │   │   ├── chunk-6JSEOBLS.js # 
│               │   │   ├── chunk-6JSEOBLS.js.map # 
│               │   │   ├── chunk-6OTNYA5E.js # 
│               │   │   ├── chunk-6OTNYA5E.js.map # 
│               │   │   ├── chunk-7NVPUXFM.js # 
│               │   │   ├── chunk-7NVPUXFM.js.map # 
│               │   │   ├── chunk-GOMI4DH3.js # 
│               │   │   ├── chunk-GOMI4DH3.js.map # 
│               │   │   ├── chunk-JI2ZN7O6.js # 
│               │   │   ├── chunk-JI2ZN7O6.js.map # 
│               │   │   ├── chunk-JJ7VEKWL.js # 
│               │   │   ├── chunk-JJ7VEKWL.js.map # 
│               │   │   ├── chunk-S2HDPD4Q.js # 
│               │   │   ├── chunk-S2HDPD4Q.js.map # 
│               │   │   ├── lucide-angular.js # 
│               │   │   ├── lucide-angular.js.map # 
│               │   │   ├── package.json # 
│               │   │   ├── rxjs.js # 
│               │   │   ├── rxjs.js.map # 
│               │   │   ├── sweetalert2.js # 
│               │   │   ├── sweetalert2.js.map # 
│               │   │   ├── swiper_element_bundle.js # 
│               │   │   ├── swiper_element_bundle.js.map # 
│               │   │   ├── uuid.js # 
│               │   │   └── uuid.js.map # 
│               │   ├── deps_ssr # 
│               │   │   ├── _metadata.json # 
│               │   │   └── package.json # 
│               │   └── com.chrome.devtools.json # 
│               ├── .tsbuildinfo # 
│               ├── angular-compiler.db # 
│               └── angular-compiler.db-lock # 
├── .firebase # 
│   └── logs # 
│       └── vsce-debug.log # 
├── .github # 
│   └── copilot-instructions.md # 
├── public # 
│   ├── coolaboration.webp # 
│   ├── favicon.ico # 
│   ├── frezza.webp # 
│   └── puzzle.jpg # 
├── src # 
│   ├── app # 
│   │   ├── auth # 
│   │   │   ├── components # 
│   │   │   │   ├── signin # 
│   │   │   │   │   ├── signin.css # 
│   │   │   │   │   ├── signin.html # 
│   │   │   │   │   └── signin.ts # 
│   │   │   │   └── signup # 
│   │   │   │       ├── signup.css # 
│   │   │   │       ├── signup.html # 
│   │   │   │       └── signup.ts # 
│   │   │   ├── guards # 
│   │   │   │   └── auth.guard.ts # 
│   │   │   └── services # 
│   │   │       └── auth.service.ts # 
│   │   ├── envirements # 
│   │   │   ├── envirement.prod.ts # 
│   │   │   └── envirement.ts # 
│   │   ├── features # 
│   │   │   ├── admin # 
│   │   │   │   ├── admin-dashboard.component.ts # 
│   │   │   │   ├── admin-dashboard.css # 
│   │   │   │   └── admin-dashboard.html # 
│   │   │   ├── onboarding # 
│   │   │   │   ├── onboarding.component.ts # 
│   │   │   │   ├── onboarding.css # 
│   │   │   │   └── onboarding.html # 
│   │   │   ├── user # 
│   │   │   │   ├── components # 
│   │   │   │   │   ├── footer # 
│   │   │   │   │   │   ├── footer.html # 
│   │   │   │   │   │   └── footer.ts # 
│   │   │   │   │   └── header # 
│   │   │   │   │       ├── header.html # 
│   │   │   │   │       └── header.ts # 
│   │   │   │   ├── pages # 
│   │   │   │   │   ├── chat # 
│   │   │   │   │   │   ├── chat.css # 
│   │   │   │   │   │   ├── chat.html # 
│   │   │   │   │   │   └── chat.ts # 
│   │   │   │   │   ├── dashboard # 
│   │   │   │   │   │   ├── dashboard.component.ts # 
│   │   │   │   │   │   ├── dashboard.css # 
│   │   │   │   │   │   └── dashboard.html # 
│   │   │   │   │   ├── explore # 
│   │   │   │   │   │   ├── explore.html # 
│   │   │   │   │   │   └── explore.ts # 
│   │   │   │   │   ├── home # 
│   │   │   │   │   │   ├── home.html # 
│   │   │   │   │   │   └── home.ts # 
│   │   │   │   │   ├── matching # 
│   │   │   │   │   │   ├── matching.component.ts # 
│   │   │   │   │   │   ├── matching.css # 
│   │   │   │   │   │   └── matching.html # 
│   │   │   │   │   ├── profil # 
│   │   │   │   │   │   ├── profil.html # 
│   │   │   │   │   │   └── profil.ts # 
│   │   │   │   │   ├── ratings # 
│   │   │   │   │   │   ├── ratings.component.ts # 
│   │   │   │   │   │   ├── ratings.css # 
│   │   │   │   │   │   └── ratings.html # 
│   │   │   │   │   ├── requests # 
│   │   │   │   │   │   ├── requests.css # 
│   │   │   │   │   │   ├── requests.html # 
│   │   │   │   │   │   └── requests.ts # 
│   │   │   │   │   ├── settings # 
│   │   │   │   │   │   ├── settings.component.ts # 
│   │   │   │   │   │   ├── settings.css # 
│   │   │   │   │   │   └── settings.html # 
│   │   │   │   │   ├── sidebar # 
│   │   │   │   │   │   ├── sidebar.html # 
│   │   │   │   │   │   └── sidebar.ts # 
│   │   │   │   │   └── suggestions # 
│   │   │   │   │       ├── suggestions.html # 
│   │   │   │   │       └── suggestions.ts # 
│   │   │   │   └── services # 
│   │   │   │       └── user-service.ts # 
│   │   │   └── visiteur # 
│   │   │       ├── footer # 
│   │   │       │   ├── footer.html # 
│   │   │       │   └── footer.ts # 
│   │   │       ├── header # 
│   │   │       │   ├── header.html # 
│   │   │       │   └── header.ts # 
│   │   │       └── home # 
│   │   │           ├── home.html # 
│   │   │           └── home.ts # 
│   │   ├── models # 
│   │   │   ├── admin.model.ts # 
│   │   │   ├── chat.model.ts # 
│   │   │   ├── index.ts # 
│   │   │   ├── swap.model.ts # 
│   │   │   └── user.model.ts # 
│   │   ├── shared # 
│   │   │   ├── components # 
│   │   │   │   ├── notifications # 
│   │   │   │   │   ├── notifications.component.ts # 
│   │   │   │   │   ├── notifications.css # 
│   │   │   │   │   └── notifications.html # 
│   │   │   │   └── toast # 
│   │   │   │       └── toast.component.ts # 
│   │   │   └── services # 
│   │   │       ├── chat.service.ts # 
│   │   │       ├── index.ts # 
│   │   │       ├── matching.service.ts # 
│   │   │       ├── notification.service.ts # 
│   │   │       ├── rating.service.ts # 
│   │   │       ├── swap.service.ts # 
│   │   │       ├── toast.service.ts # 
│   │   │       └── user.service.ts # 
│   │   ├── app.config.server.ts # 
│   │   ├── app.config.ts # 
│   │   ├── app.html # 
│   │   ├── app.routes.server.ts # 
│   │   ├── app.routes.ts # 
│   │   └── app.ts # 
│   ├── index.html # 
│   ├── main.server.ts # 
│   ├── main.ts # 
│   ├── server.ts # 
│   └── styles.css # 
├── .editorconfig # 
├── .firebaserc # 
├── .gitignore # 
├── .postcssrc.json # 
├── angular.json # 
├── app.yaml # 
├── dataconnect-debug.log # 
├── Dockerfile # 
├── firebase.json # 
├── IMPLEMENTATION_GUIDE.md # 
├── nginx.conf # 
├── package-lock.json # 
├── package.json # 
├── PROJECT_SUMMARY.md # 
├── QUICK_START.md # 
├── README.md # 
├── tsconfig.app.json # 
├── tsconfig.json # 
├── tsconfig.spec.json # 
└── wasmer.toml # 
```
