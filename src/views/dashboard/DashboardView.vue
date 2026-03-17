<template>
  <div class="dashboard">
    <!-- En-tête avec bienvenue et actions -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="welcome-title">Tableau de bord</h1>
          <p class="welcome-subtitle">Bienvenue sur votre espace de gestion</p>
        </div>
        <div class="header-actions">
          <button class="btn-icon" @click="refreshData" :disabled="refreshing" title="Rafraîchir">
            <svg :class="{ 'animate-spin': refreshing }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <!-- Bouton de téléchargement des stats -->
          <button class="btn-icon" @click="downloadStats" title="Télécharger les statistiques">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <div class="date-badge">{{ currentDate }}</div>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="stat-card"
        :class="{ 'stat-card-interactive': stat.route }"
        @click="stat.route && router.push(stat.route)"
      >
        <div class="stat-card-inner">
          <div class="stat-header">
            <div class="stat-icon-wrapper" :style="{ background: stat.iconBg + '20' }">
              <div class="stat-icon" :style="{ color: stat.iconColor }" v-html="stat.icon"></div>
            </div>
            <span class="stat-trend" :class="`stat-trend-${stat.trendType}`">
              {{ stat.trend }}
            </span>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              <span v-if="loading" class="skeleton-value"></span>
              <span v-else>{{ formatNumber(stat.value) }}</span>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section des graphiques et bilans -->
    <div class="charts-section">
      <!-- Ligne 1: Graphiques principaux -->
      <div class="charts-row">
        <!-- Graphique d'activité mensuelle -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-header-left">
              <span class="chart-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <h3 class="chart-title">Activité mensuelle</h3>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background: #3B82F6;"></span> Articles</span>
              <span class="legend-item"><span class="legend-dot" style="background: #10B981;"></span> Événements</span>
              <span class="legend-item"><span class="legend-dot" style="background: #8B5CF6;"></span> Messages</span>
            </div>
          </div>
          <div class="chart-container">
            <svg viewBox="0 0 400 180" class="chart-svg">
              <!-- Lignes de grille -->
              <line v-for="y in [30, 70, 110, 150]" :key="y" x1="40" :y1="y" x2="360" :y2="y" stroke="#E2E8F0" stroke-width="1" />
              
              <!-- Courbe des articles -->
              <polyline
                :points="getMonthlyPoints('articles')"
                fill="none"
                stroke="#3B82F6"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              
              <!-- Courbe des événements -->
              <polyline
                :points="getMonthlyPoints('events')"
                fill="none"
                stroke="#10B981"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              
              <!-- Courbe des messages -->
              <polyline
                :points="getMonthlyPoints('messages')"
                fill="none"
                stroke="#8B5CF6"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              
              <!-- Points sur la courbe des articles -->
              <circle
                v-for="(point, index) in monthlyData.articles"
                :key="'a'+index"
                :cx="40 + index * 64"
                :cy="150 - (point * 1.2)"
                r="3"
                fill="#3B82F6"
                stroke="white"
                stroke-width="2"
              />
              
              <!-- Points sur la courbe des événements -->
              <circle
                v-for="(point, index) in monthlyData.events"
                :key="'e'+index"
                :cx="40 + index * 64"
                :cy="150 - (point * 1.2)"
                r="3"
                fill="#10B981"
                stroke="white"
                stroke-width="2"
              />
              
              <!-- Points sur la courbe des messages -->
              <circle
                v-for="(point, index) in monthlyData.messages"
                :key="'m'+index"
                :cx="40 + index * 64"
                :cy="150 - (point * 1.2)"
                r="3"
                fill="#8B5CF6"
                stroke="white"
                stroke-width="2"
              />
              
              <!-- Labels des mois -->
              <text v-for="(month, index) in months" :key="index" :x="40 + index * 64" y="170" text-anchor="middle" fill="#64748B" font-size="10">{{ month }}</text>
            </svg>
          </div>
        </div>

        <!-- Camembert de répartition -->
        <div class="chart-card small">
          <div class="chart-header">
            <div class="chart-header-left">
              <span class="chart-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </span>
              <h3 class="chart-title">Répartition du contenu</h3>
            </div>
          </div>
          <div class="pie-chart-container">
            <svg viewBox="0 0 200 200" class="pie-chart">
              <!-- Parts du camembert -->
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="transparent"
                stroke="#3B82F6"
                :stroke-dasharray="getPieDasharray(statsPercent.articles)"
                stroke-dashoffset="25"
                stroke-width="40"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="transparent"
                stroke="#10B981"
                :stroke-dasharray="getPieDasharray(statsPercent.events)"
                :stroke-dashoffset="getPieOffset(statsPercent.articles)"
                stroke-width="40"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="transparent"
                stroke="#8B5CF6"
                :stroke-dasharray="getPieDasharray(statsPercent.pages)"
                :stroke-dashoffset="getPieOffset(statsPercent.articles + statsPercent.events)"
                stroke-width="40"
              />
              
              <!-- Légende intégrée -->
              <text x="100" y="95" text-anchor="middle" fill="#0F172A" font-size="14" font-weight="600">{{ totalContent }}</text>
              <text x="100" y="115" text-anchor="middle" fill="#64748B" font-size="10">éléments</text>
            </svg>
          </div>
          <div class="pie-legend">
            <div class="pie-legend-item">
              <span class="legend-dot" style="background: #3B82F6;"></span>
              <span class="legend-label">Articles</span>
              <span class="legend-value">{{ statsPercent.articles }}%</span>
            </div>
            <div class="pie-legend-item">
              <span class="legend-dot" style="background: #10B981;"></span>
              <span class="legend-label">Événements</span>
              <span class="legend-value">{{ statsPercent.events }}%</span>
            </div>
            <div class="pie-legend-item">
              <span class="legend-dot" style="background: #8B5CF6;"></span>
              <span class="legend-label">Pages</span>
              <span class="legend-value">{{ statsPercent.pages }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ligne 2: Bilans et indicateurs -->
      <div class="metrics-row">
        <!-- Bilan des publications -->
        <div class="metric-card">
          <div class="metric-icon" style="background: #EEF2FF; color: #4338CA;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-label">Publications (30j)</div>
            <div class="metric-value">{{ lastMonthStats.publications }}</div>
            <div class="metric-trend" :class="lastMonthStats.trend > 0 ? 'trend-up' : 'trend-down'">
              {{ lastMonthStats.trend > 0 ? '+' : '' }}{{ lastMonthStats.trend }}% vs mois précédent
            </div>
          </div>
        </div>

        <!-- Taux de réponse -->
        <div class="metric-card">
          <div class="metric-icon" style="background: #DCFCE7; color: #166534;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-label">Messages répondus</div>
            <div class="metric-value">{{ responseRate }}%</div>
            <div class="metric-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: responseRate + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Engagement moyen -->
        <div class="metric-card">
          <div class="metric-icon" style="background: #FEF3C7; color: #92400E;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-label">Vues / article</div>
            <div class="metric-value">{{ avgViews }}</div>
            <div class="metric-sub">Moyenne sur 30 jours</div>
          </div>
        </div>

        <!-- Satisfaction -->
        <div class="metric-card">
          <div class="metric-icon" style="background: #F3E8FF; color: #6D28D9;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-label">Satisfaction</div>
            <div class="metric-value">{{ satisfactionRate }}/5</div>
            <div class="metric-stars">
              <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= Math.round(satisfactionRate) }">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grille principale (contenu existant) -->
    <div class="dashboard-grid">
      <!-- Colonne principale -->
      <div class="main-column">
        <!-- Articles récents -->
        <div class="card card-hoverable">
          <div class="card-header">
            <div class="card-header-left">
              <span class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </span>
              <h2 class="card-title">Derniers articles</h2>
            </div>
            <RouterLink to="/articles" class="card-link">
              Voir tout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </RouterLink>
          </div>

          <!-- ... (le reste de votre code existant pour les articles) ... -->
          <div v-if="loadingArticles" class="skeleton-list">
            <div v-for="i in 3" :key="i" class="skeleton-item"></div>
          </div>

          <div v-else-if="recentArticles.length === 0" class="empty-state">
            <div class="empty-illustration">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 class="empty-title">Aucun article publié</h3>
            <p class="empty-description">Commencez à créer du contenu pour votre ministère</p>
            <RouterLink to="/articles/new" class="empty-action">
              Créer un article
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </RouterLink>
          </div>

          <div v-else class="article-list">
            <div
              v-for="article in recentArticles"
              :key="article.id"
              class="article-item"
              @click="router.push(`/articles/${article.id}`)"
            >
              <div class="article-thumb" :style="{ background: typeColors[article.type_contenu]?.bg + '20' }">
                <span v-html="typeIcons[article.type_contenu]" :style="{ color: typeColors[article.type_contenu]?.color }"></span>
              </div>
              <div class="article-content">
                <div class="article-header">
                  <h3 class="article-title">{{ article.titre }}</h3>
                  <div class="article-badges">
                    <span class="badge" :class="`badge-${typeBadge[article.type_contenu]}`">
                      {{ typeLabels[article.type_contenu] }}
                    </span>
                    <span class="badge" :class="article.statut === 'publie' ? 'badge-success' : 'badge-neutral'">
                      {{ article.statut === 'publie' ? 'Publié' : 'Brouillon' }}
                    </span>
                  </div>
                </div>
                <div class="article-meta">
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                    {{ article.categorie || 'Sans catégorie' }}
                  </span>
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(article.date_publication || article.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne latérale (contenu existant) -->
      <div class="sidebar-column">
        <!-- Prochains événements -->
        <div class="card card-hoverable">
          <div class="card-header">
            <div class="card-header-left">
              <span class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <h2 class="card-title">À venir</h2>
            </div>
            <RouterLink to="/events" class="card-link">
              Voir tout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </RouterLink>
          </div>

          <!-- ... (code existant pour les événements) ... -->
          <div v-if="loadingEvents" class="skeleton-list">
            <div v-for="i in 2" :key="i" class="skeleton-item"></div>
          </div>

          <div v-else-if="upcomingEvents.length === 0" class="empty-state small">
            <div class="empty-illustration small">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="empty-text">Aucun événement à venir</p>
            <RouterLink to="/events/new" class="empty-link">Créer un événement →</RouterLink>
          </div>

          <div v-else class="event-list">
            <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
              <div class="event-date">
                <span class="event-day">{{ getDay(event.date_debut) }}</span>
                <span class="event-month">{{ getMonth(event.date_debut) }}</span>
              </div>
              <div class="event-details">
                <h3 class="event-title">{{ event.titre }}</h3>
                <div class="event-info">
                  <span class="event-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ event.heure_debut || 'Horaire non défini' }}
                  </span>
                  <span v-if="event.lieu" class="event-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ event.lieu }}
                  </span>
                </div>
                <span class="event-tag" :class="event.categorie === 'recurrent' ? 'tag-purple' : 'tag-amber'">
                  {{ event.categorie === 'recurrent' ? 'Récurrent' : 'Ponctuel' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages récents -->
        <div class="card card-hoverable">
          <div class="card-header">
            <div class="card-header-left">
              <span class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <h2 class="card-title">Messages récents</h2>
            </div>
            <RouterLink to="/messages" class="card-link">
              Voir tout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </RouterLink>
          </div>

          <!-- ... (code existant pour les messages) ... -->
          <div v-if="loadingMessages" class="skeleton-list">
            <div v-for="i in 2" :key="i" class="skeleton-item"></div>
          </div>

          <div v-else-if="recentMessages.length === 0" class="empty-state small">
            <div class="empty-illustration small">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="empty-text">Aucun message reçu</p>
          </div>

          <div v-else class="message-list">
            <div
              v-for="msg in recentMessages"
              :key="msg.id"
              class="message-item"
              @click="router.push('/messages')"
            >
              <div class="message-avatar" :style="{ background: getAvatarColor(msg.nom_expediteur) }">
                {{ msg.nom_expediteur[0].toUpperCase() }}
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-sender">{{ msg.nom_expediteur }}</span>
                  <span class="message-time">{{ formatRelativeTime(msg.created_at) }}</span>
                </div>
                <p class="message-preview">{{ msg.sujet || msg.message?.substring(0, 50) + '...' }}</p>
              </div>
              <div v-if="msg.statut === 'non_lu'" class="message-unread-dot"></div>
            </div>
          </div>
        </div>

        <!-- Ministère info -->
        <div v-if="ministereInfo" class="card ministry-card">
          <div class="card-header">
            <div class="card-header-left">
              <span class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              <h2 class="card-title">Votre ministère</h2>
            </div>
            <RouterLink to="/settings" class="card-link">
              Modifier
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </RouterLink>
          </div>

          <div class="ministry-content">
            <div class="ministry-header">
              <div class="ministry-avatar" :style="{ background: ministereInfo.couleur_primaire + '20', color: ministereInfo.couleur_primaire }">
                {{ ministereInfo.nom[0].toUpperCase() }}
              </div>
              <div class="ministry-info">
                <h3 class="ministry-name">{{ ministereInfo.nom }}</h3>
                <span class="ministry-type">{{ ministereInfo.type }}</span>
              </div>
            </div>

            <div class="ministry-details">
              <div class="detail-item">
                <span class="detail-label">Statut</span>
                <span class="detail-value">
                  <span class="status-dot" :class="ministereInfo.statut === 'actif' ? 'status-active' : 'status-inactive'"></span>
                  {{ ministereInfo.statut }}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Domaine</span>
                <a :href="`https://${ministereInfo.sous_domaine}.eglisehub.org`" target="_blank" class="detail-link">
                  {{ ministereInfo.sous_domaine }}.eglisehub.org
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div class="detail-item">
                <span class="detail-label">Thème</span>
                <div class="theme-preview">
                  <div class="color-swatch" :style="{ background: ministereInfo.couleur_primaire }"></div>
                  <div class="color-swatch" :style="{ background: ministereInfo.couleur_secondaire || '#ffffff', border: '1px solid #e2e8f0' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { storageUrl } from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

// États de chargement
const loading = ref(true)
const loadingArticles = ref(true)
const loadingEvents = ref(true)
const loadingMessages = ref(true)
const refreshing = ref(false)

// Données
const dashData = ref(null)
const recentArticles = ref([])
const upcomingEvents = ref([])
const recentMessages = ref([])

const ministereId = computed(() => auth.user?.ministere_id)
const ministereInfo = computed(() => dashData.value?.ministere)

// Date actuelle
const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

// Mois pour les graphiques
const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']

// Données mensuelles simulées (à remplacer par vos vraies données API)
const monthlyData = computed(() => {
  const d = dashData.value?.monthly || {
    articles: [4, 6, 8, 7, 12, 9],
    events: [2, 3, 5, 4, 6, 7],
    messages: [8, 12, 15, 11, 18, 14]
  }
  return d
})

// Points pour les courbes SVG
function getMonthlyPoints(type) {
  const data = monthlyData.value[type] || []
  return data.map((value, index) => {
    const x = 40 + index * 64
    const y = 150 - (value * 1.2)
    return `${x},${y}`
  }).join(' ')
}

// Calcul des pourcentages pour le camembert
const statsPercent = computed(() => {
  const d = dashData.value?.stats
  const total = (d?.articles?.total || 0) + (d?.evenements?.total || 0) + (d?.pages?.total || 0)
  if (total === 0) return { articles: 33, events: 33, pages: 34 }
  
  return {
    articles: Math.round((d?.articles?.total || 0) / total * 100),
    events: Math.round((d?.evenements?.total || 0) / total * 100),
    pages: Math.round((d?.pages?.total || 0) / total * 100)
  }
})

const totalContent = computed(() => {
  const d = dashData.value?.stats
  return (d?.articles?.total || 0) + (d?.evenements?.total || 0) + (d?.pages?.total || 0)
})

// Helpers pour le camembert
function getPieDasharray(percent) {
  const circumference = 2 * Math.PI * 80
  return `${(percent / 100) * circumference} ${circumference}`
}

function getPieOffset(percent) {
  const circumference = 2 * Math.PI * 80
  return 25 - (percent / 100) * circumference / 2
}

// Statistiques avancées
const lastMonthStats = computed(() => {
  return {
    publications: 24,
    trend: 12
  }
})

const responseRate = computed(() => {
  const d = dashData.value?.stats?.messages
  if (!d) return 0
  const total = d.total || 0
  const replied = total - (d.non_lus || 0)
  return total > 0 ? Math.round((replied / total) * 100) : 0
})

const avgViews = computed(() => {
  return '245'
})

const satisfactionRate = computed(() => {
  return 4.5
})

// Stats cards
const stats = computed(() => {
  const d = dashData.value?.stats
  return [
    {
      key: 'pages',
      label: 'Pages',
      value: d?.pages?.total ?? 0,
      trend: `${d?.pages?.publiees ?? 0} publiées`,
      trendType: d?.pages?.publiees > 0 ? 'up' : 'neutral',
      route: '/pages',
      iconBg: '#4338CA',
      iconColor: '#4338CA',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`,
    },
    {
      key: 'articles',
      label: 'Articles',
      value: d?.articles?.total ?? 0,
      trend: `${d?.articles?.publies ?? 0} publiés`,
      trendType: d?.articles?.publies > 0 ? 'up' : 'neutral',
      route: '/articles',
      iconBg: '#D97706',
      iconColor: '#D97706',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
      </svg>`,
    },
    {
      key: 'evenements',
      label: 'Événements',
      value: d?.evenements?.total ?? 0,
      trend: `${d?.evenements?.a_venir ?? 0} à venir`,
      trendType: d?.evenements?.a_venir > 0 ? 'up' : 'neutral',
      route: '/events',
      iconBg: '#16A34A',
      iconColor: '#16A34A',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>`,
    },
    {
      key: 'messages',
      label: 'Messages',
      value: d?.messages?.total ?? 0,
      trend: `${d?.messages?.non_lus ?? 0} non lus`,
      trendType: d?.messages?.non_lus > 0 ? 'warning' : 'neutral',
      route: '/messages',
      iconBg: '#BE185D',
      iconColor: '#BE185D',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>`,
    },
  ]
})

// Types d'articles
const typeLabels = {
  texte: 'Texte',
  lien_externe: 'Lien',
  video_youtube: 'YouTube',
  audio: 'Audio',
  mixte: 'Mixte',
}

const typeIcons = {
  texte: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>`,
  video_youtube: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>`,
  lien_externe: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
  </svg>`,
  audio: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM21 16c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
  </svg>`,
}

const typeColors = {
  texte: { bg: '#4338CA', color: '#4338CA' },
  video_youtube: { bg: '#DC2626', color: '#DC2626' },
  lien_externe: { bg: '#0369A1', color: '#0369A1' },
  audio: { bg: '#16A34A', color: '#16A34A' },
  mixte: { bg: '#9333EA', color: '#9333EA' },
}

const typeBadge = {
  texte: 'primary',
  video_youtube: 'error',
  lien_externe: 'info',
  audio: 'success',
  mixte: 'purple',
}

// Helpers
function formatNumber(num) {
  return num?.toLocaleString('fr-FR') || '0'
}

function formatDate(date) {
  if (!date) return '–'
  return new Date(date).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  })
}

function formatRelativeTime(date) {
  if (!date) return '–'
  const now = new Date()
  const then = new Date(date)
  const diff = Math.floor((now - then) / 1000 / 60) // minutes
  
  if (diff < 1) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff} min`
  if (diff < 120) return 'Il y a 1h'
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`
  return formatDate(date)
}

function getDay(date) {
  if (!date) return '–'
  return new Date(date).getDate()
}

function getMonth(date) {
  if (!date) return '–'
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short' })
}

function getAvatarColor(name) {
  const colors = [
    'linear-gradient(135deg, #4338CA, #6366F1)',
    'linear-gradient(135deg, #7C3AED, #A78BFA)',
    'linear-gradient(135deg, #DB2777, #EC4899)',
    'linear-gradient(135deg, #059669, #10B981)',
    'linear-gradient(135deg, #B45309, #D97706)',
  ]
  const index = (name?.length || 0) % colors.length
  return colors[index]
}

// Téléchargement des stats
function downloadStats() {
  const statsData = {
    date: new Date().toISOString(),
    ministere: ministereInfo.value,
    statistiques: dashData.value?.stats,
    mensuel: monthlyData.value,
    bilans: {
      publications_30j: lastMonthStats.value.publications,
      tendance: lastMonthStats.value.trend,
      taux_reponse: responseRate.value,
      vues_moyennes: avgViews.value,
      satisfaction: satisfactionRate.value
    }
  }
  
  const blob = new Blob([JSON.stringify(statsData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `statistiques-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Rafraîchissement
async function refreshData() {
  refreshing.value = true
  await Promise.all([
    loadDashboard(),
    loadArticles(),
    loadEvents(),
    loadMessages()
  ])
  refreshing.value = false
}

// Chargement des données
async function loadDashboard() {
  try {
    const params = ministereId.value ? { ministere_id: ministereId.value } : {}
    const { data } = await api.get('/ministry/dashboard', { params })
    dashData.value = data.data
  } catch (e) {
    console.error('Dashboard error:', e)
  } finally {
    loading.value = false
  }
}

async function loadArticles() {
  try {
    const params = { per_page: 5 }
    if (ministereId.value) params.ministere_id = ministereId.value
    const { data } = await api.get('/ministry/articles', { params })
    recentArticles.value = data.data?.data || data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingArticles.value = false
  }
}

async function loadEvents() {
  try {
    const params = { statut: 'a_venir', per_page: 3 }
    if (ministereId.value) params.ministere_id = ministereId.value
    const { data } = await api.get('/ministry/events', { params })
    upcomingEvents.value = data.data?.data || data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingEvents.value = false
  }
}

async function loadMessages() {
  try {
    const params = { per_page: 3 }
    if (ministereId.value) params.ministere_id = ministereId.value
    const { data } = await api.get('/ministry/contact-messages', { params })
    recentMessages.value = data.data?.data || data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingMessages.value = false
  }
}

onMounted(() => {
  loadDashboard()
  loadArticles()
  loadEvents()
  loadMessages()
})
</script>

<style scoped>
/* Styles existants conservés */

.dashboard {
  padding: 24px;
  background: #F8FAFC;
  min-height: 100vh;
}

/* Header */
.dashboard-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 4px 0;
  font-family: 'Sora', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  background: white;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #3B82F6;
  background: #EFF6FF;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.date-badge {
  padding: 8px 16px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card-interactive {
  cursor: pointer;
}

.stat-card-interactive:hover {
  transform: translateY(-2px);
  border-color: #3B82F6;
  box-shadow: 0 12px 24px -8px rgba(59, 130, 246, 0.15);
}

.stat-card-inner {
  position: relative;
  z-index: 1;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
  background: #F8FAFC;
}

.stat-trend-up { color: #16A34A; background: #DCFCE7; }
.stat-trend-down { color: #DC2626; background: #FEE2E2; }
.stat-trend-warning { color: #D97706; background: #FEF3C7; }
.stat-trend-neutral { color: #64748B; background: #F1F5F9; }

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

/* Charts Section */
.charts-section {
  margin-bottom: 32px;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 20px;
}

.chart-card.small {
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3B82F6;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748B;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chart-container {
  width: 100%;
  height: 180px;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

.pie-chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.pie-chart {
  width: 140px;
  height: 140px;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 8px;
}

.pie-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-value {
  margin-left: auto;
  font-weight: 600;
  color: #0F172A;
}

/* Metrics Row */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.metric-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-label {
  font-size: 11px;
  color: #64748B;
  margin-bottom: 2px;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  font-family: 'Sora', system-ui, sans-serif;
  line-height: 1.2;
  margin-bottom: 4px;
}

.metric-trend {
  font-size: 10px;
  font-weight: 500;
}

.trend-up { color: #16A34A; }
.trend-down { color: #DC2626; }

.metric-sub {
  font-size: 10px;
  color: #94A3B8;
}

.metric-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3B82F6;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.metric-stars {
  display: flex;
  gap: 2px;
  margin-top: 4px;
}

.star {
  color: #CBD5E1;
  font-size: 14px;
}

.star.active {
  color: #FBBF24;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
}

.main-column,
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Cards */
.card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s;
}

.card-hoverable:hover {
  border-color: #CBD5E1;
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3B82F6;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
  font-family: 'Sora', system-ui, sans-serif;
}

.card-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #3B82F6;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  background: #F8FAFC;
}

.card-link:hover {
  background: #EFF6FF;
  color: #1D4ED8;
}

/* Skeleton Loading */
.skeleton-value {
  display: inline-block;
  width: 60px;
  height: 32px;
  background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  height: 64px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state.small {
  padding: 24px 16px;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  margin-bottom: 8px;
}

.empty-illustration.small {
  width: 64px;
  height: 64px;
  border-radius: 32px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.empty-description {
  font-size: 13px;
  color: #64748B;
  margin: 0 0 8px 0;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3B82F6;
  color: white;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.empty-action:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.empty-text {
  font-size: 13px;
  color: #94A3B8;
  margin: 0;
}

.empty-link {
  color: #3B82F6;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
}

.empty-link:hover {
  color: #1D4ED8;
}

/* Articles */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.article-item:hover {
  background: #F8FAFC;
  transform: translateX(4px);
}

.article-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.article-content {
  flex: 1;
  min-width: 0;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.article-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.article-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
}

/* Badges */
.badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.badge-primary { background: #EEF2FF; color: #4338CA; }
.badge-success { background: #DCFCE7; color: #166534; }
.badge-error { background: #FEE2E2; color: #991B1B; }
.badge-warning { background: #FEF3C7; color: #92400E; }
.badge-info { background: #E0F2FE; color: #0369A1; }
.badge-purple { background: #F3E8FF; color: #6D28D9; }
.badge-neutral { background: #F1F5F9; color: #475569; }

/* Events */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 8px;
  border-radius: 14px;
  transition: background 0.2s;
}

.event-item:hover {
  background: #F8FAFC;
}

.event-date {
  min-width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1E3A8A, #3B82F6);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  line-height: 1.2;
}

.event-day {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.event-month {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.9;
}

.event-details {
  flex: 1;
}

.event-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 4px 0;
}

.event-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 6px;
}

.event-time,
.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748B;
}

.event-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 600;
}

.tag-purple { background: #F3E8FF; color: #6D28D9; }
.tag-amber { background: #FEF3C7; color: #92400E; }

/* Messages */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.message-item:hover {
  background: #F8FAFC;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-sender {
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
}

.message-time {
  font-size: 10px;
  color: #94A3B8;
}

.message-preview {
  font-size: 12px;
  color: #64748B;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-unread-dot {
  width: 8px;
  height: 8px;
  background: #3B82F6;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 12px;
}

/* Ministry Card */
.ministry-card {
  background: linear-gradient(135deg, white, #F8FAFC);
}

.ministry-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ministry-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ministry-avatar {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

.ministry-info {
  flex: 1;
}

.ministry-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 4px 0;
  font-family: 'Sora', system-ui, sans-serif;
}

.ministry-type {
  font-size: 12px;
  color: #64748B;
  text-transform: capitalize;
  background: #F1F5F9;
  padding: 4px 8px;
  border-radius: 6px;
}

.ministry-details {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
  border-top: 1px solid #E2E8F0;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-label {
  font-size: 13px;
  color: #64748B;
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active {
  background: #10B981;
  box-shadow: 0 0 0 2px #D1FAE5;
}

.status-inactive {
  background: #94A3B8;
  box-shadow: 0 0 0 2px #E2E8F0;
}

.detail-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3B82F6;
  text-decoration: none;
  font-size: 12px;
  transition: color 0.2s;
}

.detail-link:hover {
  color: #1D4ED8;
}

.theme-preview {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 8px;
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard {
    padding: 16px;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-row {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .article-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .article-badges {
    justify-content: flex-start;
  }
}
</style>