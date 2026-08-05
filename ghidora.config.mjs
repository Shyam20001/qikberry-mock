
export default {
  // Root of the monorepo
  workspaceRoot: process.cwd(),
  totalParallelTasks: 3,

  // Package discovery (JS, Rust, Go, Python, anything)
  packages: [
    "packages/*",
    "apps/*"
  ],

  // Local deterministic cache (WASM tar/targz)
  cacheDir: ".ghidora/cache",
  cloudCache: {
    enabled: false,
    url: "http://localhost:4000",
    token: "secret123", // optional
  },
  executor: "npm",
  shell: true,          // opens for raw exec cmds 
  // enableSandbox: false,
  sandbox: {
    // cwd: process.cwd(),
    // clearEnv: true,  // Deno.Command will always respect this config regardless of sandbox.
    env: {
      GHIDORA_ENV: "Safe Env from Deno Sandbox via GHIDORA",
      NODE_ENV: "development",

      //  PATH: [
      // your allowed bin paths
      //  ].join(";")
    },
    windowsRawArguments: true,  // Deno Safe WIN Spawn
  },

  // ONLY tasks declared here get:
  // - DAG ordering
  // - caching
  // - guarantees
  //
  // Undeclared tasks still run (lerna-style),
  // but WITHOUT cache or DAG.
  tasks: {
    build: {
      inputs: [
        "src",
        "Cargo.toml",
        "Cargo.lock",
        "package.json"
      ],
      // Files produced by build (per package)
      // Used ONLY for cache save/restore
      outputs: [
        "dist",
        "build",
        "out",
        "target/release"
      ],

      // Run test on dependency packages first
      // dependsOn: ["test"]
    },

    test: {
      // Tests require build to have run
      dependsOn: ["build"]
    },

    dev: {
      // Long-running (watch / dev servers)
      persistent: true
    },

    serve: {
      // Runtime servers (frontend / backend)
      persistent: true
    }
  }
};
