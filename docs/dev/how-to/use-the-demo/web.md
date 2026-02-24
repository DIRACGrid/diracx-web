# Accessing DiracX Web in the demo

This guide explains how to access the DiracX Web interface when running the demo environment via `run_demo.sh`.

## Finding the web URL

When you start the demo with `run_demo.sh`, the script outputs the URLs for all services. Look for the web interface URL in the output:

```
DiracX Web is available at: https://...
```

The URL is also available via the environment variables sourced by the demo setup.

## Logging in

1. Open the web URL in your browser.
2. You will be redirected to the authentication page.
3. Use the demo credentials provided in the `run_demo.sh` output to log in.
4. After successful authentication, you will be redirected to the dashboard.

## Navigating the dashboard

The dashboard provides access to all available DiracX Web applications:

- **Job Monitor** — Search, filter, and manage jobs
- **Application management** — Add, organize, and share application instances

Use the left sidebar to switch between applications. You can add new application instances and organize them into groups.

For more details on using specific features, see the [User Guide](../../../user/how-to/index.md).
