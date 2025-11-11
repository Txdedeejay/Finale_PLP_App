const natural = require('natural');
const compromise = require('compromise');
const { AIKnowledgeBase } = require('../models/AIChat');

class AIService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.initializeClassifier();
  }

  async initializeClassifier() {
    // Train classifier with sample data
    const knowledge = await AIKnowledgeBase.find();
    knowledge.forEach(item => {
      item.keywords.forEach(keyword => {
        this.classifier.addDocument(keyword, item.category);
      });
    });
    this.classifier.train();
  }

  async generateResponse(userMessage, context) {
    // Analyze user intent
    const intent = this.analyzeIntent(userMessage);
    const category = this.classifier.classify(userMessage);

    // Get relevant knowledge
    const knowledge = await AIKnowledgeBase.find({ category })
      .sort({ relevanceScore: -1 })
      .limit(3);

    // Generate response based on intent and context
    let response = '';
    let suggestions = [];
    let actions = [];
    let references = [];

    switch (intent.type) {
      case 'partner_matching':
        response = this.generatePartnerMatchingResponse(intent, context);
        suggestions = [
          "Find NGOs with similar missions",
          "Explore partnership opportunities",
          "View collaboration guidelines"
        ];
        break;

      case 'data_analysis':
        response = this.generateDataAnalysisResponse(intent, context);
        suggestions = [
          "Analyze impact metrics",
          "Generate reports",
          "Compare with benchmarks"
        ];
        break;

      case 'fundraising':
        response = this.generateFundraisingResponse(intent, context);
        suggestions = [
          "Crowdfunding strategies",
          "Grant writing tips",
          "Donor engagement"
        ];
        break;

      case 'volunteer_management':
        response = this.generateVolunteerResponse(intent, context);
        suggestions = [
          "Recruitment strategies",
          "Training programs",
          "Retention techniques"
        ];
        break;

      default:
        response = this.generateGeneralResponse(userMessage, knowledge);
        suggestions = [
          "How can I find NGOs with similar missions?",
          "Help me analyze our impact data",
          "Best practices for volunteer management"
        ];
    }

    // Add knowledge-based insights
    if (knowledge.length > 0) {
      response += '\n\n**Related Insights:**\n';
      knowledge.forEach(item => {
        response += `• ${item.title}: ${item.content.substring(0, 100)}...\n`;
        references.push({
          title: item.title,
          url: `#knowledge/${item.category}`
        });
      });
    }

    return {
      response,
      suggestions,
      actions,
      references
    };
  }

  analyzeIntent(message) {
    const doc = compromise(message.toLowerCase());
    
    if (doc.has('partner match collaboration network')) {
      return { type: 'partner_matching', confidence: 0.9 };
    }
    
    if (doc.has('data analysis metrics report analytics')) {
      return { type: 'data_analysis', confidence: 0.85 };
    }
    
    if (doc.has('fundraising money donation grant fund')) {
      return { type: 'fundraising', confidence: 0.8 };
    }
    
    if (doc.has('volunteer management recruitment training')) {
      return { type: 'volunteer_management', confidence: 0.75 };
    }

    return { type: 'general', confidence: 0.5 };
  }

  generatePartnerMatchingResponse(intent, context) {
    return `Based on your NGO's focus areas (${context.ngoFocus.join(', ')}), I recommend these strategies for finding partners:

**1. Mission Alignment:** Look for NGOs with complementary goals that can enhance your impact.
**2. Geographic Synergy:** Partner with organizations in the same regions for better resource utilization.
**3. Resource Sharing:** Identify partners who can provide resources you lack (expertise, funding, volunteers).

I can help you search our database of verified NGOs and identify potential collaboration opportunities. Would you like me to show you some matches?`;
  }

  generateDataAnalysisResponse(intent, context) {
    return `For effective data analysis in the NGO sector, consider these key metrics:

**Impact Metrics:**
• Beneficiaries reached and demographics
• Services delivered and outcomes achieved
• Long-term community changes
• Cost per beneficiary

**Operational Metrics:**
• Volunteer engagement rates
• Fund utilization efficiency
• Project completion timelines
• Stakeholder satisfaction

I can help you set up data collection forms and generate insights from your existing data.`;
  }

  generateFundraisingResponse(intent, context) {
    return `Modern fundraising strategies for NGOs:

**Digital Approaches:**
• Social media crowdfunding campaigns
• Online donation platforms with recurring options
• Virtual fundraising events
• Corporate matching gift programs

**Traditional Methods:**
• Grant writing for foundations
• Major donor cultivation
• Community fundraising events
• Partnership with local businesses

**Pro Tip:** Focus on storytelling and impact measurement to attract donors.`;
  }

  generateVolunteerResponse(intent, context) {
    return `Effective volunteer management strategies:

**Recruitment:**
• Clear role descriptions with specific time commitments
• Multiple onboarding pathways (virtual, in-person)
• Skills-based matching

**Engagement:**
• Regular training and development opportunities
• Recognition programs and impact feedback
• Flexible scheduling options

**Retention:**
• Career progression paths for long-term volunteers
• Community building activities
• Meaningful impact reporting

Would you like specific templates for volunteer management?`;
  }

  generateGeneralResponse(message, knowledge) {
    return `I understand you're asking about "${message}". As an NGO assistant, I can provide insights and recommendations based on best practices in the non-profit sector.

Based on your query, here are some areas I can help with:
• Partnership development and collaboration
• Data collection and impact measurement
• Fundraising strategy and donor engagement
• Volunteer management and recruitment
• Project planning and implementation

Could you provide more specific details about what you're looking to achieve?`;
  }

  async analyzeData(dataType, data, ngoId) {
    // Simple analysis based on data type
    switch (dataType) {
      case 'impact_metrics':
        return this.analyzeImpactMetrics(data);
      case 'volunteer_data':
        return this.analyzeVolunteerData(data);
      case 'financial_data':
        return this.analyzeFinancialData(data);
      default:
        return this.generalDataAnalysis(data);
    }
  }

  analyzeImpactMetrics(data) {
    const insights = [];
    
    if (data.beneficiariesServed > 1000) {
      insights.push('Large scale impact detected. Consider case studies for fundraising.');
    }
    
    if (data.successRate > 0.8) {
      insights.push('High success rate indicates effective program implementation.');
    }
    
    return {
      insights,
      recommendations: [
        'Implement longitudinal studies for long-term impact measurement',
        'Consider third-party validation for credibility',
        'Use impact data in donor communications'
      ]
    };
  }

  analyzeVolunteerData(data) {
    const insights = [];
    
    if (data.retentionRate < 0.5) {
      insights.push('Volunteer retention needs improvement. Consider engagement strategies.');
    }
    
    if (data.skillUtilization < 0.6) {
      insights.push('Volunteer skills may be underutilized. Review role assignments.');
    }
    
    return {
      insights,
      recommendations: [
        'Implement volunteer feedback system',
        'Create skill development opportunities',
        'Establish clear volunteer progression paths'
      ]
    };
  }
}

module.exports = AIService;