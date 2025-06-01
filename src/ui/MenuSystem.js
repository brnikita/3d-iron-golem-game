// Menu system for game menus and UI
class MenuSystem {
    constructor() {
        this.currentMenu = null;
        this.menus = new Map();
        console.log('MenuSystem initialized');
    }

    initialize() {
        // Create basic menu elements
        this.createPauseMenu();
        this.createGameOverMenu();
    }

    createPauseMenu() {
        const pauseMenu = document.createElement('div');
        pauseMenu.id = 'pauseMenu';
        pauseMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            color: white;
        `;
        
        const menuContent = document.createElement('div');
        menuContent.style.cssText = `
            background: #2a2a2a;
            border: 3px solid #fff;
            padding: 40px;
            text-align: center;
            border-radius: 10px;
        `;
        
        // Создаем заголовок
        const title = document.createElement('h2');
        title.textContent = 'Game Paused';
        title.style.marginBottom = '30px';
        menuContent.appendChild(title);
        
        // Создаем кнопку Resume
        const resumeButton = document.createElement('button');
        resumeButton.textContent = 'Resume';
        resumeButton.style.cssText = `
            display: block;
            width: 200px;
            padding: 12px;
            margin: 10px auto;
            background: #4a4a4a;
            color: white;
            border: 2px solid #fff;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            cursor: pointer;
        `;
        resumeButton.addEventListener('click', () => {
            if (window.game?.gameEngine) {
                window.game.gameEngine.resume();
                this.hideCurrentMenu();
            }
        });
        menuContent.appendChild(resumeButton);
        
        // Создаем кнопку Restart
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.style.cssText = `
            display: block;
            width: 200px;
            padding: 12px;
            margin: 10px auto;
            background: #4a4a4a;
            color: white;
            border: 2px solid #fff;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            cursor: pointer;
        `;
        restartButton.addEventListener('click', () => {
            if (window.game?.gameEngine) {
                window.game.gameEngine.restart();
                this.hideCurrentMenu();
            }
        });
        menuContent.appendChild(restartButton);
        
        pauseMenu.appendChild(menuContent);
        document.body.appendChild(pauseMenu);
        this.menus.set('pause', pauseMenu);
    }

    createGameOverMenu() {
        const gameOverMenu = document.createElement('div');
        gameOverMenu.id = 'gameOverMenu';
        gameOverMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            color: white;
        `;
        
        const menuContent = document.createElement('div');
        menuContent.style.cssText = `
            background: #2a2a2a;
            border: 3px solid #fff;
            padding: 40px;
            text-align: center;
            border-radius: 10px;
        `;
        
        // Создаем заголовок
        const title = document.createElement('h2');
        title.textContent = 'Game Over';
        title.style.cssText = 'margin-bottom: 30px; color: #ff4444;';
        menuContent.appendChild(title);
        
        // Создаем описание
        const description = document.createElement('p');
        description.textContent = 'The Iron Golem has fallen!';
        description.style.marginBottom = '20px';
        menuContent.appendChild(description);
        
        // Создаем кнопку Try Again
        const tryAgainButton = document.createElement('button');
        tryAgainButton.textContent = 'Try Again';
        tryAgainButton.style.cssText = `
            display: block;
            width: 200px;
            padding: 12px;
            margin: 10px auto;
            background: #4a4a4a;
            color: white;
            border: 2px solid #fff;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            cursor: pointer;
        `;
        tryAgainButton.addEventListener('click', () => {
            if (window.game?.gameEngine) {
                window.game.gameEngine.restart();
                this.hideCurrentMenu();
            }
        });
        menuContent.appendChild(tryAgainButton);
        
        gameOverMenu.appendChild(menuContent);
        document.body.appendChild(gameOverMenu);
        this.menus.set('gameOver', gameOverMenu);
    }

    showPauseMenu() {
        this.showMenu('pause');
    }

    showGameOverMenu() {
        this.showMenu('gameOver');
    }

    showMenu(menuName) {
        // Hide current menu
        if (this.currentMenu) {
            this.currentMenu.style.display = 'none';
        }
        
        // Show new menu
        const menu = this.menus.get(menuName);
        if (menu) {
            menu.style.display = 'flex';
            this.currentMenu = menu;
        }
    }

    hideCurrentMenu() {
        if (this.currentMenu) {
            this.currentMenu.style.display = 'none';
            this.currentMenu = null;
        }
    }

    dispose() {
        this.menus.forEach(menu => {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        });
        this.menus.clear();
        console.log('MenuSystem disposed');
    }
}

// Make MenuSystem globally accessible
window.MenuSystem = MenuSystem; 