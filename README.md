# Nexa Port - AI Portfolio Management

Nexa Port is an advanced AI-powered Portfolio Management system designed to revolutionize your portfolio management experience through sophisticated analysis and intelligent recommendations.

## Features

### Core Features
- **Portfolio Analysis**: Comprehensive analysis of your portfolio's performance, risk metrics, and returns using advanced AI algorithms
- **Investment Strategy**: AI-driven investment recommendations based on market trends, risk tolerance, and investment goals
- **Real-time Monitoring**: Continuous tracking of portfolio performance with instant alerts and updates
- **Risk Assessment**: Advanced risk metrics including Sharpe ratio, Sortino ratio, and maximum drawdown analysis

### Technical Features
- **AI Integration**: Leverages GPT-4 and custom ML models for portfolio analysis
- **Security**: Enhanced security features with optional local model processing
- **Data Visualization**: Interactive charts and graphs powered by Recharts
- **Responsive Design**: Full mobile and desktop compatibility

## How to Deploy

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ for local development
- Python 3.9+ for backend services

### Deployment Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nexa-port.git
cd nexa-port
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build and start services:
```bash
docker-compose up -d
```

### Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Usage

1. Access the web interface at http://localhost:3000
2. Upload your portfolio CSV file with the required format
3. Select your investment strategy and preferences
4. Review the AI-generated analysis and recommendations

## License

MIT License - see LICENSE file for details