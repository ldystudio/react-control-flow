/**
 * Simple test server for E2E tests
 */

const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visible Component E2E Test</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: sans-serif; }
        .spacer { height: 150vh; background: linear-gradient(to bottom, #f0f0f0, #e0e0e0); }
        .content { padding: 20px; background: #fff; }
        .fallback { background: #ffeb3b; padding: 20px; }
        .visible-content { background: #4caf50; color: white; padding: 20px; }
        #root { min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        import React from 'https://esm.sh/react@19';
        import ReactDOM from 'https://esm.sh/react-dom@19/client';

        // Visible component implementation (inline for E2E test)
        function Visible({
            children,
            fallback = null,
            rootMargin = "0px",
            threshold = 0,
            once = true,
            onVisibilityChange,
        }) {
            const [isVisible, setIsVisible] = React.useState(false);
            const [hasBeenVisible, setHasBeenVisible] = React.useState(false);
            const [isClient, setIsClient] = React.useState(false);
            const ref = React.useRef(null);

            const isSupported = typeof window !== "undefined" && typeof IntersectionObserver !== "undefined";

            React.useEffect(() => {
                setIsClient(true);
            }, []);

            React.useEffect(() => {
                if (!isClient) return;

                if (!isSupported) {
                    setIsVisible(true);
                    setHasBeenVisible(true);
                    return;
                }

                const element = ref.current;
                if (!element) return;

                const observer = new IntersectionObserver(
                    (entries) => {
                        const entry = entries[0];
                        if (entry) {
                            const visible = entry.isIntersecting;
                            setIsVisible(visible);
                            onVisibilityChange?.(visible);

                            if (visible) {
                                setHasBeenVisible(true);
                                if (once) {
                                    observer.disconnect();
                                }
                            }
                        }
                    },
                    { rootMargin, threshold }
                );

                observer.observe(element);

                return () => observer.disconnect();
            }, [isClient, isSupported, rootMargin, threshold, once, onVisibilityChange]);

            if (!isClient) {
                return children;
            }

            if (!isSupported) {
                return children;
            }

            const shouldRender = once ? hasBeenVisible : isVisible;

            return React.createElement('div', { ref, 'data-testid': 'visible-wrapper' },
                shouldRender ? children : fallback
            );
        }

        // Test App
        function App() {
            const [visibilityLog, setVisibilityLog] = React.useState([]);

            const handleVisibilityChange = (isVisible) => {
                setVisibilityLog(prev => [...prev, { time: Date.now(), isVisible }]);
                window.lastVisibilityChange = isVisible;
            };

            return React.createElement('div', null,
                // Spacer to push content below viewport
                React.createElement('div', { className: 'spacer', 'data-testid': 'spacer' },
                    React.createElement('div', { className: 'content' },
                        'Scroll down to see the Visible component'
                    )
                ),

                // Visible component with once=true (default)
                React.createElement(Visible, {
                    fallback: React.createElement('div', {
                        className: 'fallback',
                        'data-testid': 'fallback-once'
                    }, 'Loading (once=true)...'),
                    onVisibilityChange: handleVisibilityChange,
                },
                    React.createElement('div', {
                        className: 'visible-content',
                        'data-testid': 'content-once'
                    }, 'Visible Content (once=true)')
                ),

                // Spacer
                React.createElement('div', { style: { height: '50px' } }),

                // Visible component with once=false
                React.createElement(Visible, {
                    once: false,
                    fallback: React.createElement('div', {
                        className: 'fallback',
                        'data-testid': 'fallback-toggle'
                    }, 'Loading (once=false)...'),
                },
                    React.createElement('div', {
                        className: 'visible-content',
                        'data-testid': 'content-toggle'
                    }, 'Visible Content (once=false)')
                ),

                // Spacer at bottom
                React.createElement('div', { className: 'spacer' })
            );
        }

        // Render
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
    </script>
</body>
</html>
`;

const server = Bun.serve({
    port: 3456,
    fetch(_req) {
        return new Response(html, {
            headers: { "Content-Type": "text/html" },
        });
    },
});

console.log(`E2E test server running at http://localhost:${server.port}`);
