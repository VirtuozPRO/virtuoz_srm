from flask import Flask, render_template_string, request, jsonify, redirect
import json
import secrets
from datetime import datetime
import sqlite3

app = Flask(__name__)
from flask_cors import CORS
CORS(app)  # Разрешить запросы из других доменов
app.secret_key = secrets.token_hex(32)

class SegmentBot:
    def __init__(self, db_path="segments.db"):
        self.db_path = db_path
    
    def get_segments(self):
        """Получить все сегменты из базы"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_segments ORDER BY id")
            segments = cursor.fetchall()
            conn.close()
            
            result = []
            for seg in segments:
                result.append({
                    'id': seg[0],
                    'name': seg[1],
                    'description': seg[2],
                    'criteria': json.loads(seg[3]) if seg[3] else {},
                    'created_at': seg[4]
                })
            return result
        except Exception as e:
            print(f"Error getting segments: {e}")
            return []
    
    def get_telegram_users(self):
        """Получить пользователей Telegram"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM telegram_users")
            count = cursor.fetchone()[0]
            conn.close()
            return count
        except:
            return 0
    
    def create_segment(self, name, description, criteria):
        """Создать новый сегмент"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO user_segments (name, description, criteria, created_at) VALUES (?, ?, ?, ?)",
                (name, description, json.dumps(criteria), datetime.now().isoformat())
            )
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error creating segment: {e}")
            return False
    
    def delete_segment(self, segment_id):
        """Удалить сегмент"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_segments WHERE id = ?", (segment_id,))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error deleting segment: {e}")
            return False

bot = SegmentBot()

# Главная страница с красивым интерфейсом
@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Segment Bot - Панель управления</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .header {
                background: rgba(255, 255, 255, 0.95);
                padding: 40px;
                border-radius: 20px;
                margin-bottom: 30px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                text-align: center;
            }
            
            h1 {
                color: #333;
                font-size: 3em;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .subtitle {
                color: #666;
                font-size: 1.2em;
                margin-bottom: 30px;
            }
            
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                background: #667eea;
                color: white;
                padding: 15px 30px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 1.1em;
                margin: 10px;
            }
            
            .btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
            }
            
            .btn-success {
                background: #4CAF50;
            }
            
            .btn-success:hover {
                background: #45a049;
                box-shadow: 0 10px 25px rgba(76, 175, 80, 0.4);
            }
            
            .btn-warning {
                background: #ff9800;
            }
            
            .btn-warning:hover {
                background: #e68900;
                box-shadow: 0 10px 25px rgba(255, 152, 0, 0.4);
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }
            
            .stat-card {
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                transition: transform 0.3s;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-number {
                font-size: 3.5em;
                font-weight: bold;
                color: #667eea;
                display: block;
                line-height: 1;
            }
            
            .stat-label {
                color: #666;
                font-size: 1.1em;
                margin-top: 10px;
            }
            
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }
            
            .feature-card {
                background: white;
                padding: 25px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .feature-icon {
                font-size: 2.5em;
                margin-bottom: 15px;
            }
            
            .card {
                background: white;
                padding: 30px;
                border-radius: 20px;
                margin-bottom: 30px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            }
            
            .quick-actions {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: center;
                margin: 30px 0;
            }
            
            @media (max-width: 768px) {
                .header {
                    padding: 25px;
                }
                
                h1 {
                    font-size: 2.2em;
                }
                
                .btn {
                    padding: 12px 24px;
                    font-size: 1em;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Telegram Segment Bot</h1>
                <p class="subtitle">Управление пользовательскими сегментами с аналитикой</p>
                
                <div class="quick-actions">
                    <a href="/dashboard" class="btn">
                        <span>📈</span> Панель управления
                    </a>
                    <a href="/api/segments" class="btn btn-success">
                        <span>📋</span> JSON API
                    </a>
                    <button onclick="showQuickStats()" class="btn btn-warning">
                        <span>📊</span> Быстрая статистика
                    </button>
                </div>
            </div>
            
            <div class="stats-grid" id="statsContainer">
                <!-- Статистика загрузится через JavaScript -->
            </div>
            
            <div class="card">
                <h2 style="color: #333; margin-bottom: 20px; text-align: center;">✨ Возможности системы</h2>
                <div class="features">
                    <div class="feature-card">
                        <div class="feature-icon">🔍</div>
                        <h3>Сегментация пользователей</h3>
                        <p>Группировка по критериям: возраст, страна, активность, покупки и др.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>Аналитика и статистика</h3>
                        <p>Детальная аналитика по каждому сегменту и пользователям</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔐</div>
                        <h3>Telegram интеграция</h3>
                        <p>Авторизация через Telegram и управление пользователями</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📤</div>
                        <h3>Экспорт данных</h3>
                        <p>Экспорт сегментов в JSON, CSV форматы</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                
                const statsContainer = document.getElementById('statsContainer');
                statsContainer.innerHTML = `
                    <div class="stat-card">
                        <span class="stat-number">${data.segments || 0}</span>
                        <span class="stat-label">Сегментов</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${data.users || 0}</span>
                        <span class="stat-label">Пользователей</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${data.criteria_total || 0}</span>
                        <span class="stat-label">Критериев</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${data.active || 1}</span>
                        <span class="stat-label">Активных сессий</span>
                    </div>
                `;
            } catch (error) {
                console.log('Ошибка загрузки статистики:', error);
            }
        }
        
        function showQuickStats() {
            fetch('/api/segments')
                .then(response => response.json())
                .then(segments => {
                    let criteriaCount = 0;
                    segments.forEach(segment => {
                        criteriaCount += Object.keys(segment.criteria).length;
                    });
                    
                    alert(`📊 Быстрая статистика:
• Всего сегментов: ${segments.length}
• Всего критериев: ${criteriaCount}
• Среднее критериев на сегмент: ${(criteriaCount / segments.length).toFixed(1)}
• Последний сегмент: ${segments[segments.length-1]?.name || 'Нет'}`);
                });
        }
        
        // Загружаем статистику при старте
        loadStats();
        </script>
    </body>
    </html>
    '''

# Панель управления с таблицей сегментов
@app.route('/dashboard')
def dashboard():
    try:
        segments = bot.get_segments()
        user_count = bot.get_telegram_users()
        
        # Считаем общее количество критериев
        total_criteria = sum(len(segment['criteria']) for segment in segments)
        
        # Формируем строки таблицы
        table_rows = ""
        for segment in segments:
            criteria = segment['criteria']
            criteria_badges = ""
            
            # Создаем бейджи для критериев (первые 5)
            for i, (key, value) in enumerate(list(criteria.items())[:5]):
                if i < 5:
                    criteria_badges += f'<span class="criteria-badge">{key}: {str(value)[:20]}</span>'
            
            # Если критериев больше 5, показываем счетчик
            if len(criteria) > 5:
                criteria_badges += f'<span class="criteria-more">+{len(criteria)-5}</span>'
            
            table_rows += f'''
            <tr>
                <td>
                    <div class="segment-name">{segment['name']}</div>
                    <div class="segment-id">ID: {segment['id']}</div>
                </td>
                <td>{segment['description']}</td>
                <td>
                    <div class="criteria-container">
                        {criteria_badges}
                    </div>
                </td>
                <td>
                    <div class="date">{segment['created_at'][:10]}</div>
                    <div class="time">{segment['created_at'][11:16]}</div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="viewSegment({segment['id']})" title="Просмотр">
                            👁️
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteSegment({segment['id']})" title="Удалить">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
            '''
        
        return f'''
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Панель управления - Segment Bot</title>
            <style>
                :root {{
                    --primary: #667eea;
                    --primary-dark: #5a67d8;
                    --success: #4CAF50;
                    --danger: #f44336;
                    --warning: #ff9800;
                    --gray: #f5f7fa;
                    --text: #333;
                    --text-light: #666;
                }}
                
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                }}
                
                body {{
                    background: var(--gray);
                    color: var(--text);
                }}
                
                .dashboard-container {{
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                
                /* Header */
                .dashboard-header {{
                    background: linear-gradient(135deg, var(--primary) 0%, #764ba2 100%);
                    color: white;
                    padding: 40px;
                    border-radius: 20px;
                    margin-bottom: 30px;
                    position: relative;
                    overflow: hidden;
                }}
                
                .dashboard-header::before {{
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" opacity="0.1"><path fill="white" d="M0,50 Q250,0 500,50 T1000,50 V100 H0 Z"/></svg>');
                    background-size: cover;
                }}
                
                .header-content {{
                    position: relative;
                    z-index: 2;
                }}
                
                .dashboard-header h1 {{
                    font-size: 2.8em;
                    margin-bottom: 10px;
                    font-weight: 700;
                }}
                
                .dashboard-header p {{
                    font-size: 1.2em;
                    opacity: 0.9;
                    margin-bottom: 25px;
                }}
                
                .back-link {{
                    color: white;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    opacity: 0.9;
                    transition: opacity 0.3s;
                }}
                
                .back-link:hover {{
                    opacity: 1;
                }}
                
                /* Stats */
                .stats-overview {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }}
                
                .stat-item {{
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    text-align: center;
                    transition: transform 0.3s;
                }}
                
                .stat-item:hover {{
                    transform: translateY(-5px);
                }}
                
                .stat-value {{
                    font-size: 2.8em;
                    font-weight: bold;
                    color: var(--primary);
                    display: block;
                    line-height: 1;
                }}
                
                .stat-label {{
                    color: var(--text-light);
                    font-size: 1.1em;
                    margin-top: 10px;
                }}
                
                /* Controls */
                .controls-bar {{
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                }}
                
                .control-buttons {{
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }}
                
                .control-btn {{
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--primary);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }}
                
                .control-btn:hover {{
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                }}
                
                .control-btn.success {{
                    background: var(--success);
                }}
                
                .control-btn.warning {{
                    background: var(--warning);
                }}
                
                .search-box {{
                    padding: 12px 20px;
                    border: 2px solid #e0e0e0;
                    border-radius: 10px;
                    font-size: 1em;
                    min-width: 250px;
                }}
                
                /* Table */
                .segments-table-container {{
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    margin-bottom: 40px;
                }}
                
                .table-header {{
                    padding: 25px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }}
                
                table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                
                thead {{
                    background: #f8f9fa;
                }}
                
                th {{
                    padding: 20px;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-light);
                    border-bottom: 2px solid #eee;
                }}
                
                td {{
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    vertical-align: top;
                }}
                
                tbody tr {{
                    transition: background-color 0.2s;
                }}
                
                tbody tr:hover {{
                    background-color: #f8f9fa;
                }}
                
                .segment-name {{
                    font-weight: 600;
                    font-size: 1.1em;
                    color: var(--text);
                }}
                
                .segment-id {{
                    font-size: 0.85em;
                    color: var(--text-light);
                    margin-top: 5px;
                }}
                
                .criteria-container {{
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    max-width: 300px;
                }}
                
                .criteria-badge {{
                    background: #e3f2fd;
                    color: #1976d2;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85em;
                    white-space: nowrap;
                }}
                
                .criteria-more {{
                    background: #f5f5f5;
                    color: var(--text-light);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85em;
                }}
                
                .date {{
                    font-weight: 600;
                }}
                
                .time {{
                    font-size: 0.9em;
                    color: var(--text-light);
                    margin-top: 5px;
                }}
                
                .action-buttons {{
                    display: flex;
                    gap: 8px;
                }}
                
                .action-btn {{
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2em;
                    transition: all 0.3s;
                }}
                
                .view-btn {{
                    background: #e3f2fd;
                    color: #1976d2;
                }}
                
                .view-btn:hover {{
                    background: #bbdefb;
                    transform: scale(1.1);
                }}
                
                .delete-btn {{
                    background: #ffebee;
                    color: var(--danger);
                }}
                
                .delete-btn:hover {{
                    background: #ffcdd2;
                    transform: scale(1.1);
                }}
                
                /* Modal */
                .modal {{
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }}
                
                .modal-content {{
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }}
                
                @media (max-width: 768px) {{
                    .dashboard-container {{
                        padding: 10px;
                    }}
                    
                    .dashboard-header {{
                        padding: 25px;
                    }}
                    
                    .dashboard-header h1 {{
                        font-size: 2em;
                    }}
                    
                    .controls-bar {{
                        flex-direction: column;
                        align-items: stretch;
                    }}
                    
                    .search-box {{
                        min-width: auto;
                        width: 100%;
                    }}
                    
                    th, td {{
                        padding: 15px 10px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="header-content">
                        <h1>📊 Панель управления сегментами</h1>
                        <p>Управляйте пользовательскими сегментами, анализируйте данные и настраивайте критерии</p>
                        <a href="/" class="back-link">
                            ← На главную страницу
                        </a>
                    </div>
                </div>
                
                <!-- Statistics -->
                <div class="stats-overview">
                    <div class="stat-item">
                        <span class="stat-value">{len(segments)}</span>
                        <span class="stat-label">Всего сегментов</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{user_count}</span>
                        <span class="stat-label">Пользователей Telegram</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{total_criteria}</span>
                        <span class="stat-label">Всего критериев</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{len(segments) / max(user_count, 1):.1f}</span>
                        <span class="stat-label">Сегментов на пользователя</span>
                    </div>
                </div>
                
                <!-- Controls -->
                <div class="controls-bar">
                    <div class="control-buttons">
                        <button class="control-btn" onclick="showCreateModal()">
                            <span>+</span> Создать сегмент
                        </button>
                        <button class="control-btn success" onclick="refreshData()">
                            <span>🔄</span> Обновить
                        </button>
                        <button class="control-btn warning" onclick="exportData()">
                            <span>📥</span> Экспорт JSON
                        </button>
                    </div>
                    <input type="text" class="search-box" placeholder="Поиск сегментов..." onkeyup="filterTable()" id="searchInput">
                </div>
                
                <!-- Table -->
                <div class="segments-table-container">
                    <div class="table-header">
                        <h2>📁 Все сегменты ({len(segments)})</h2>
                        <div style="color: var(--text-light);">
                            Отсортировано по дате создания
                        </div>
                    </div>
                    
                    <table id="segmentsTable">
                        <thead>
                            <tr>
                                <th width="20%">Название</th>
                                <th width="30%">Описание</th>
                                <th width="30%">Критерии</th>
                                <th width="10%">Создан</th>
                                <th width="10%">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table_rows}
                        </tbody>
                    </table>
                </div>
                
                <!-- Modal for creating segment -->
                <div class="modal" id="createModal">
                    <div class="modal-content">
                        <h2 style="margin-bottom: 25px;">Создать новый сегмент</h2>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">
                                Название сегмента
                            </label>
                            <input type="text" id="segmentName" 
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1em;"
                                   placeholder="Например: Активные пользователи">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">
                                Описание
                            </label>
                            <textarea id="segmentDescription" 
                                      style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1em; height: 100px;"
                                      placeholder="Подробное описание сегмента..."></textarea>
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">
                                Критерии (JSON)
                            </label>
                            <textarea id="segmentCriteria" 
                                      style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1em; height: 150px; font-family: monospace;">
{{
    "platform": "telegram",
    "min_activity": 10,
    "has_photo": true
}}</textarea>
                        </div>
                        
                        <div style="display: flex; gap: 15px; justify-content: flex-end;">
                            <button onclick="createSegment()" 
                                    style="background: var(--primary); color: white; padding: 12px 30px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                                Создать сегмент
                            </button>
                            <button onclick="closeModal()" 
                                    style="background: #f5f5f5; color: var(--text); padding: 12px 30px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
            // Функции для работы с таблицей
            function filterTable() {{
                const input = document.getElementById('searchInput');
                const filter = input.value.toLowerCase();
                const table = document.getElementById('segmentsTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {{
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(filter) ? '' : 'none';
                }}
            }}
            
            // Функции для модального окна
            function showCreateModal() {{
                document.getElementById('createModal').style.display = 'flex';
            }}
            
            function closeModal() {{
                document.getElementById('createModal').style.display = 'none';
            }}
            
            // Функции для работы с сегментами
            function createSegment() {{
                const name = document.getElementById('segmentName').value;
                const description = document.getElementById('segmentDescription').value;
                const criteriaText = document.getElementById('segmentCriteria').value;
                
                if (!name) {{
                    alert('Введите название сегмента');
                    return;
                }}
                
                try {{
                    const criteria = JSON.parse(criteriaText);
                    
                    fetch('/api/create-segment', {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{
                            name: name,
                            description: description,
                            criteria: criteria
                        }})
                    }})
                    .then(response => response.json())
                    .then(data => {{
                        if (data.success) {{
                            alert('✅ Сегмент успешно создан!');
                            closeModal();
                            location.reload();
                        }} else {{
                            alert('❌ Ошибка: ' + data.error);
                        }}
                    }});
                }} catch (e) {{
                    alert('❌ Ошибка в JSON: ' + e.message);
                }}
            }}
            
            function viewSegment(id) {{
                fetch('/api/segments/' + id)
                    .then(response => response.json())
                    .then(data => {{
                        if (data) {{
                            const criteriaText = JSON.stringify(data.criteria, null, 2);
                            alert(`📋 Детали сегмента:
Название: ${{data.name}}
Описание: ${{data.description}}
ID: ${{data.id}}
Создан: ${{data.created_at}}

Критерии:
${{criteriaText}}`);
                        }}
                    }});
            }}
            
            function deleteSegment(id) {{
                if (confirm('Вы уверены, что хотите удалить этот сегмент?')) {{
                    fetch('/api/segments/' + id, {{
                        method: 'DELETE'
                    }})
                    .then(response => response.json())
                    .then(data => {{
                        if (data.success) {{
                            alert('✅ Сегмент успешно удален!');
                            location.reload();
                        }} else {{
                            alert('❌ Ошибка удаления');
                        }}
                    }});
                }}
            }}
            
            function refreshData() {{
                location.reload();
            }}
            
            function exportData() {{
                fetch('/api/segments')
                    .then(response => response.json())
                    .then(data => {{
                        const dataStr = JSON.stringify(data, null, 2);
                        const dataBlob = new Blob([dataStr], {{type: 'application/json'}});
                        const url = URL.createObjectURL(dataBlob);
                        
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'segments_export_' + new Date().toISOString().slice(0,10) + '.json';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        alert('✅ Данные экспортированы в JSON файл!');
                    }});
            }}
            
            // Закрытие модального окна при клике вне его
            window.onclick = function(event) {{
                const modal = document.getElementById('createModal');
                if (event.target === modal) {{
                    closeModal();
                }}
            }}
            </script>
        </body>
        </html>
        '''
    except Exception as e:
        return f"<h1>Ошибка: {str(e)}</h1><a href='/'>На главную</a>"

# API endpoints
@app.route('/api/stats')
def get_stats():
    try:
        segments = bot.get_segments()
        user_count = bot.get_telegram_users()
        total_criteria = sum(len(segment['criteria']) for segment in segments)
        
        return jsonify({
            'segments': len(segments),
            'users': user_count,
            'criteria_total': total_criteria,
            'active': 1,
            'status': 'ok'
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/segments')
def get_segments_api():
    return jsonify(bot.get_segments())

@app.route('/api/segments/<int:segment_id>')
def get_segment_api(segment_id):
    try:
        segments = bot.get_segments()
        for segment in segments:
            if segment['id'] == segment_id:
                return jsonify(segment)
        return jsonify({'error': 'Segment not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-segment', methods=['POST'])
def create_segment_api():
    try:
        data = request.json
        name = data.get('name')
        description = data.get('description', '')
        criteria = data.get('criteria', {})
        
        if not name:
            return jsonify({'success': False, 'error': 'Name is required'})
        
        success = bot.create_segment(name, description, criteria)
        if success:
            return jsonify({'success': True, 'message': 'Segment created'})
        else:
            return jsonify({'success': False, 'error': 'Failed to create segment'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/segments/<int:segment_id>', methods=['DELETE'])
def delete_segment_api(segment_id):
    try:
        success = bot.delete_segment(segment_id)
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Segment not found'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/test-login')
def test_login():
    return '''
    <!DOCTYPE html>
    <html>
    <body style="padding: 40px; text-align: center;">
        <h1 style="color: #4CAF50;">✅ Тестовый вход выполнен!</h1>
        <p>Теперь вы можете использовать панель управления:</p>
        <a href="/dashboard" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px;">
            📊 Перейти в панель управления
        </a>
        <br>
        <a href="/" style="color: #666;">← На главную</a>
    </body>
    </html>
    '''

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 TELEGRAM SEGMENT BOT - WEB INTERFACE")
    print("=" * 60)
    print("✅ API сегментов доступен по адресу: /api/segments")
    print("📊 Панель управления: http://127.0.0.1:5000/dashboard")
    print("🏠 Главная страница: http://127.0.0.1:5000")
    print("🔗 Всего сегментов в базе: 6")
    print("=" * 60)
    
    app.run(host='127.0.0.1', port=5000, debug=False)