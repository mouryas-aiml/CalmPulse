import React, { useState, useEffect } from 'react';
import './Insights.css';
import TranslatedText from '../components/TranslatedText';

// Sample insights data for demonstration
const insightsData = [
  {
    id: 1,
    title: "AI in Mental Healthcare",
    content: "Artificial Intelligence is transforming mental healthcare through motion sensors that can identify anxiety symptoms like nail biting and knuckle cracking. AI can also help train therapists by assessing their competencies, though experts emphasize it won't replace human mental health professionals.",
    detailedContent: "Artificial Intelligence is rapidly changing how mental health professionals diagnose and treat patients. Recent studies have shown that AI algorithms can detect subtle behavioral patterns associated with anxiety, depression, and other conditions, often before they become apparent to human observers.\n\nOne study from Stanford University utilized computer vision to identify physical manifestations of anxiety, such as nail-biting, knuckle cracking, and repetitive tapping, with 86% accuracy. When combined with language analysis, this accuracy increased to 92%.\n\nAI is also being employed to enhance therapist training. Systems that can evaluate a therapist's empathetic responses, identify when they miss important cues, and provide real-time suggestions are showing promise in educational settings. This technology acts as a supplementary tool that helps therapists improve their skills rather than replacing the human element.\n\nAs these technologies advance, ethical considerations around privacy, data security, and the potential for algorithmic bias remain crucial concerns. Mental health experts emphasize that while AI tools can assist with screening and monitoring, the therapeutic relationship between patient and provider remains the cornerstone of effective mental healthcare.",
    category: "Technology",
    source: "Halo Mental Health Research, 2024",
    tags: ["technology", "AI", "innovation"],
    publishDate: "February 18, 2024"
  },
  {
    id: 2,
    title: "Psychedelics as Treatment Options",
    content: "Psychedelic medicine is gaining mainstream acceptance with growing research supporting drugs like MDMA, Ketamine, and Psilocybin for treating depression, PTSD, anxiety disorders, and addiction. Ketamine therapy is already available nationwide, while others are being studied in clinical trials and state-level pilot programs.",
    detailedContent: "Psychedelic-assisted therapy represents one of the most significant paradigm shifts in mental health treatment in decades. After years of prohibition and stigma, these substances are being rigorously studied for their therapeutic potential.\n\nKetamine therapy has led this revolution, with FDA approval for treatment-resistant depression when administered as esketamine (Spravato). Standard ketamine is widely used off-label for depression, anxiety, and PTSD. Typical protocols involve a series of intravenous or intranasal administrations in controlled clinical settings, often producing rapid relief where conventional antidepressants have failed.\n\nMDMA (3,4-methylenedioxymethamphetamine) has shown remarkable promise for PTSD treatment. In phase 3 clinical trials, 67% of participants with severe PTSD no longer met diagnostic criteria for the condition after MDMA-assisted therapy sessions. The FDA is expected to approve MDMA therapy for PTSD by 2024, creating a new treatment paradigm for this difficult-to-treat condition.\n\nPsilocybin, the active compound in 'magic mushrooms,' has demonstrated effectiveness for treatment-resistant depression, existential anxiety in terminal illness, and substance use disorders. In 2023, Oregon became the first state to implement a regulated psilocybin services program, with Colorado following suit.\n\nUnlike conventional daily medications, psychedelic treatments typically involve just 1-3 sessions with the substance, combined with preparatory and integration therapy. This approach aims to catalyze profound shifts in perspective and emotional processing rather than simply managing symptoms.",
    category: "Treatment",
    source: "Mental State of the World Report, 2023",
    tags: ["treatment", "research", "psychedelics"],
    publishDate: "December 5, 2023"
  },
  {
    id: 3,
    title: "Trauma-Informed Care Approach",
    content: "Approximately 64% of U.S. adults have experienced at least one traumatic event. Mental health practitioners are increasingly adopting Trauma-Informed Care, which shifts focus from 'What's wrong with you?' to 'What happened to you?' This recognizes how trauma influences behavior and health long after the event.",
    detailedContent: "Trauma-Informed Care (TIC) has emerged as a fundamental approach across healthcare and social services, recognizing the widespread impact of trauma on individuals' physical, emotional, and psychological wellbeing.\n\nThe core principle of TIC involves a paradigm shift from viewing challenging behaviors as pathological to understanding them as adaptive responses to traumatic experiences. This approach is guided by six key principles: safety, trustworthiness and transparency, peer support, collaboration, empowerment, and cultural sensitivity.\n\nResearch indicates that adverse childhood experiences (ACEs) and other traumatic events can literally rewire the brain's stress response systems. The ACE Study found that individuals with four or more adverse childhood experiences had significantly higher rates of depression, substance use disorders, heart disease, and even early mortality.\n\nHealthcare providers implementing TIC conduct universal screening for trauma history, create physically and emotionally safe environments, avoid practices that might trigger trauma responses, and collaborate with patients on treatment decisions. In mental health settings specifically, therapists use evidence-based approaches like Cognitive Processing Therapy, EMDR (Eye Movement Desensitization and Reprocessing), and Somatic Experiencing to address trauma.\n\nThe benefits of trauma-informed approaches extend beyond individual patients to entire systems and communities. Organizations that implement TIC report improved patient outcomes, reduced staff burnout, and more effective service delivery overall.",
    category: "Practice",
    source: "Sapien Labs, 2023",
    tags: ["trauma", "therapy", "care"],
    publishDate: "October 18, 2023"
  },
  {
    id: 4,
    title: "Virtual Reality in Psychiatric Treatment",
    content: "Virtual reality technology is emerging as a powerful tool for treating various mental health concerns. By creating simulated environments, VR allows patients to confront fears, practice coping strategies, and improve social skills in a controlled, safe setting, showing promising results for PTSD and anxiety disorders.",
    detailedContent: "Virtual Reality (VR) therapy has evolved from an experimental technique to an evidence-based treatment approach for numerous psychiatric conditions. This technological intervention offers unique advantages over traditional exposure therapy and skills training.\n\nFor anxiety disorders, VR exposure therapy allows clinicians to create precisely controlled simulations of feared situations—from flying and public speaking to heights and crowded spaces. Studies show that VR exposure therapy for phobias and anxiety disorders achieves similar or superior outcomes to in vivo exposure, with the added benefits of privacy, convenience, and greater patient willingness to engage.\n\nIn PTSD treatment, VR environments can simulate combat zones, accident scenes, or other trauma contexts with multi-sensory stimuli (visual, auditory, and sometimes haptic feedback). The therapist maintains complete control over the intensity and can immediately modify or halt the exposure if distress becomes overwhelming. A landmark study with military veterans found that VR-assisted therapy resulted in a 45% reduction in PTSD symptoms compared to a 23% reduction with traditional therapy alone.\n\nFor autism spectrum disorders and social anxiety, VR social training modules allow users to practice conversations and social interactions in realistic scenarios with virtual characters. These applications offer immediate feedback, graduated difficulty levels, and endless repetition without the social consequences of real-world mistakes.\n\nAdvanced VR systems now incorporate biofeedback mechanisms that monitor physiological markers of stress (heart rate, skin conductance, respiration) and adjust the virtual environment in real-time based on the user's anxiety levels. This creates a personalized therapeutic experience that adapts to each individual's progress.",
    category: "Technology",
    source: "McKinsey Wellness Trends Report, 2024",
    tags: ["technology", "VR", "treatment"],
    publishDate: "January 30, 2024"
  },
  {
    id: 5,
    title: "Blood Tests for Mental Health Conditions",
    content: "Researchers at Indiana University School of Medicine have developed a blood test that can identify RNA biomarkers signaling mood disorders. This test can assess depression severity and predict the likelihood of someone developing severe depression or bipolar disorder, potentially transforming how mental health conditions are diagnosed.",
    detailedContent: "The development of blood-based biomarkers for psychiatric conditions represents a potential revolution in mental health diagnostics, moving the field toward the objective assessment standards seen in other medical specialties.\n\nThe groundbreaking research from Indiana University School of Medicine identified a panel of 31 RNA biomarkers in blood samples that could distinguish between patients with major depressive disorder, bipolar disorder, and healthy controls with over 80% accuracy. What makes this approach particularly valuable is its ability to not only confirm current mood disorders but also predict future risk—identifying patients who might later develop more severe depression or transition from depression to bipolar disorder.\n\nThese RNA markers reflect gene expression patterns associated with mood regulation, stress response, inflammatory pathways, and circadian rhythm functions. The test's developers suggest it could transform psychiatric practice in several ways:\n\n1. Reducing diagnostic uncertainty and delay, especially for conditions like bipolar disorder that typically take 5-10 years to diagnose correctly\n2. Providing objective measures of illness severity and treatment response\n3. Enabling precision psychiatry by matching patients to treatments most likely to benefit their specific biological subtype of depression\n4. Identifying at-risk individuals who might benefit from preventive interventions before symptoms become severe\n\nWhile this technology is still being refined and validated in larger populations, it represents a significant step toward integrating biological markers into psychiatric assessment. Experts emphasize that these tests will complement rather than replace clinical evaluation, adding an objective dimension to the diagnostic process.",
    category: "Research",
    source: "Verywell Mind Mental Health Forecast, 2025",
    tags: ["research", "diagnostics", "innovation"],
    publishDate: "March 7, 2024"
  },
  {
    id: 6,
    title: "Rise of Social Prescribing",
    content: "Social prescribing is gaining traction as healthcare providers now 'prescribe' community activities, volunteering, arts, nature, and group learning instead of just medication. This approach addresses social determinants of mental health and reduces over-reliance on pharmaceutical interventions.",
    detailedContent: "Social prescribing represents a holistic approach to health and wellbeing that addresses the social, emotional, and practical needs of individuals alongside their medical requirements. This model enables healthcare professionals to refer patients to non-clinical services in the community.\n\nThe concept originated in the United Kingdom but has rapidly expanded globally. In areas with established social prescribing programs, healthcare providers can connect patients to local resources such as art classes, walking groups, volunteer opportunities, debt counseling, housing support, and community gardens. These non-medical interventions target the social determinants of health that traditional healthcare often overlooks.\n\nEvidence supporting social prescribing is growing steadily. A 2023 meta-analysis found that social prescribing interventions resulted in significant improvements in mental wellbeing, social connectedness, and quality of life. Specifically, programs showed an average 17% reduction in depression symptoms and a 28% reduction in feelings of loneliness among participants.\n\nHealthcare systems benefit as well, with studies documenting reductions in primary care visits (28%), emergency department attendance (24%), and hospital admissions (17%) among patients engaged in social prescribing programs. These outcomes translate to substantial cost savings and reduced burden on overstretched medical resources.\n\nImplementation typically involves 'link workers' or 'community connectors' who work between healthcare providers and community organizations. These professionals take time to understand each individual's needs, help them set goals, and connect them with appropriate local activities and support.",
    category: "Practice",
    source: "Global Wellness Institute, 2024",
    tags: ["community", "integrative", "holistic"],
    publishDate: "February 12, 2024"
  },
  {
    id: 7,
    title: "Digital Phenotyping in Mental Health",
    content: "Digital phenotyping uses data from smartphones and wearables to identify behavioral patterns that indicate mental health changes. Passive data collection from device sensors can detect sleep disturbances, social withdrawal, and activity changes before symptoms become severe.",
    detailedContent: "Digital phenotyping represents a transformative approach to mental health monitoring that leverages the digital footprints we generate through everyday technology use. By analyzing smartphone and wearable device data, this method can identify subtle behavioral patterns associated with mental health conditions.\n\nThe technology collects two primary types of data: passive data (gathered without any active user input) and active data (requiring user engagement). Passive data includes metrics such as:\n\n• Movement patterns and geolocation data that may indicate social withdrawal or decreased activity\n• Sleep duration and quality inferred from phone usage and screen activity patterns\n• Communication patterns, including frequency and timing of calls and messages\n• Voice features during calls, such as tone, rhythm, and vocal energy\n• Typing patterns, including speed, error rates, and correction behaviors\n\nA landmark study from Harvard Medical School found that these digital biomarkers could predict depression symptoms with 87% accuracy—often detecting changes 2-3 weeks before clinical symptoms became apparent to patients or clinicians. For bipolar disorder, digital phenotyping has shown particular promise in identifying the subtle behavioral changes that precede manic episodes.\n\nPrivacy and ethical considerations remain paramount in this field. Leading platforms use advanced encryption, de-identification protocols, and transparent consent processes. Users maintain control over what data is collected and how it's used, with options to pause or discontinue monitoring at any time.\n\nAs this technology matures, it promises to enable more personalized and preventive mental healthcare, identifying warning signs early enough for intervention before a full-blown episode occurs.",
    category: "Technology",
    source: "Nature Digital Medicine, 2023",
    tags: ["technology", "monitoring", "prevention"],
    publishDate: "November 15, 2023"
  },
  {
    id: 8,
    title: "Climate Anxiety and Eco-Therapy",
    content: "As climate change impacts intensify, therapists report rising cases of climate anxiety and eco-grief. Eco-therapy is emerging as a specialized approach that acknowledges environmental distress while promoting sustainable action, nature connection, and resilience building.",
    detailedContent: "Climate anxiety, also called eco-anxiety, has emerged as a significant psychological phenomenon affecting increasingly large segments of the population, particularly young people. This condition manifests as chronic fear of environmental doom, feelings of helplessness, and grief over ecological losses.\n\nA global survey of 10,000 young people aged 16-25 found that 75% described the future as 'frightening' due to climate change, while 56% believed 'humanity is doomed.' These fears are not unfounded but represent rational responses to real threats, making them particularly challenging to address through conventional therapeutic approaches.\n\nEco-therapy has developed as a specialized practice to address climate-related distress. Unlike traditional therapy that might pathologize these concerns, eco-therapy validates environmental fears while providing frameworks for resilience. Core components include:\n\n• Nature connection practices that strengthen personal relationships with the natural world\n• Community building with others who share similar concerns, reducing isolation\n• Mindfulness techniques specifically adapted for processing ecological grief\n• Balanced information consumption to avoid overwhelm from negative news\n• Meaningful action that aligns with personal values and provides a sense of agency\n\nClinical outcomes suggest that eco-therapy participants experience significant reductions in general anxiety symptoms, improved sense of meaning, and greater emotional resilience. The approach recognizes that climate anxiety isn't simply a problem to be eliminated but a response that can motivate constructive engagement when properly channeled.\n\nAs climate impacts intensify, mental health systems are increasingly integrating climate-aware approaches into standard practice, with organizations like the Climate Psychology Alliance providing specialized training for therapists.",
    category: "Wellness",
    source: "American Psychological Association, 2024",
    tags: ["climate", "anxiety", "nature"],
    publishDate: "January 22, 2024"
  },
  {
    id: 9,
    title: "Microbiome-Gut-Brain Connection",
    content: "Research reveals strong connections between gut microbiome and mental health. Bacterial composition influences brain development, stress responses, and neurotransmitter production, suggesting dietary interventions as potential complementary treatments for conditions like depression and anxiety.",
    detailedContent: "The microbiome-gut-brain axis has emerged as a groundbreaking field of research, illuminating intricate connections between intestinal microorganisms and mental health. This bidirectional communication system between the central nervous system and gut microbiota operates through neural, immune, endocrine, and metabolic pathways.\n\nStudies have demonstrated that the gut microbiome influences brain development, stress response systems, and the production of neurotransmitters including serotonin, dopamine, and GABA. Up to 95% of the body's serotonin is produced in the gut, with gut bacteria playing a crucial regulatory role in this process.\n\nExperimental research has shown that transferring gut microbiota from humans with depression to microbiome-free rodents induces depression-like behaviors in the animals. Conversely, introducing specific beneficial bacterial strains (particularly from the Lactobacillus and Bifidobacterium genera) has demonstrated antidepressant and anxiolytic effects in both animal models and human trials.\n\nDietary patterns significantly impact microbiome composition, with Mediterranean and plant-rich diets promoting microbial diversity associated with improved mental health outcomes. Conversely, Western diets high in processed foods and sugar correlate with microbiome alterations linked to increased inflammation and higher rates of depression and anxiety.\n\nClinical applications of this research include emerging treatments like psychobiotics (probiotic supplements with mood-modifying properties), targeted dietary interventions, and fecal microbiota transplantation for treatment-resistant psychiatric conditions. A 2023 randomized controlled trial found that a 12-week microbiome-focused dietary intervention produced a 32% reduction in depression symptoms compared to a 14% reduction in the control group.\n\nAs this field advances, it promises to provide new pathways for understanding and treating mental health disorders, potentially offering personalized, microbiome-based approaches that complement traditional psychiatric treatments.",
    category: "Research",
    source: "Journal of Psychiatric Research, 2023",
    tags: ["microbiome", "nutrition", "mental health"],
    publishDate: "August 14, 2023"
  },
  {
    id: 10,
    title: "Transcranial Magnetic Stimulation Breakthroughs",
    content: "TMS therapy is gaining wider adoption for treatment-resistant depression with new FDA-approved protocols delivering faster results in just 5 days versus traditional 6-week treatments. This non-invasive brain stimulation approach offers an alternative to medication.",
    detailedContent: "Transcranial Magnetic Stimulation (TMS) has revolutionized the treatment landscape for medication-resistant depression, offering a non-invasive alternative that directly modulates neural activity in regions of the brain implicated in mood regulation.\n\nConventional TMS protocols involve daily 40-minute sessions over six weeks, but recent advances have dramatically accelerated treatment timelines. Stanford Accelerated Intelligent Neuromodulation Therapy (SAINT), FDA-approved in 2023, delivers multiple treatment sessions per day over just five days, with remission rates of 79% in clinical trials—significantly higher than the 30-40% typically seen with standard TMS protocols.\n\nThe technology works by generating magnetic pulses that induce electrical currents in targeted brain regions, particularly the dorsolateral prefrontal cortex, which shows abnormal activity patterns in depression. Unlike electroconvulsive therapy, TMS doesn't require anesthesia or induce seizures, and cognitive side effects are minimal or nonexistent.\n\nBeyond depression, TMS applications are expanding to other psychiatric and neurological conditions. FDA approvals now include OCD and smoking cessation, with promising research underway for PTSD, generalized anxiety disorder, bipolar depression, and substance use disorders.\n\nTechnological innovations are further enhancing TMS efficacy and accessibility. These include:\n\n• Deep TMS systems that can reach deeper brain structures\n• Theta-burst stimulation that reduces session times from 40 minutes to under 10 minutes\n• Personalized targeting using functional MRI to identify the optimal stimulation location for each patient\n• Portable TMS devices being developed for home use under remote clinical supervision\n\nWhile cost and accessibility have historically limited TMS adoption, improved insurance coverage and the development of more efficient protocols are making this treatment increasingly available to the millions of patients who don't respond adequately to antidepressant medications.",
    category: "Treatment",
    source: "Brain Stimulation Journal, 2024",
    tags: ["neurostimulation", "depression", "technology"],
    publishDate: "April 3, 2024"
  }
];

function Insights() {
  const [insights, setInsights] = useState(insightsData);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInsights, setFilteredInsights] = useState(insights);

  // Filter insights based on category and search term
  useEffect(() => {
    let filtered = insights;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(insight => insight.category === selectedCategory);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(insight => 
        insight.title.toLowerCase().includes(term) || 
        insight.content.toLowerCase().includes(term) ||
        insight.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredInsights(filtered);
  }, [selectedCategory, searchTerm, insights]);

  // Get unique categories
  const categories = ['All', ...new Set(insights.map(insight => insight.category))];

  // View a specific insight
  const viewInsight = (insight) => {
    setSelectedInsight(insight);
    // Scroll to top when viewing a new insight
    window.scrollTo(0, 0);
  };

  // Return to insights list
  const backToList = () => {
    setSelectedInsight(null);
  };

  return (
    <div className="journal">
      <div className="journal-container">
        <h1><TranslatedText text="Mental Wellness Insights" /></h1>
        <p className="journal-description">
          <TranslatedText text="Stay informed about the latest trends, research, and breakthroughs in mental health and wellness." />
        </p>

        {!selectedInsight ? (
          <>
            <div className="insights-filters">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={<TranslatedText text="Search insights..." />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search"></i>
              </div>
              
              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <TranslatedText text={category} />
                  </button>
                ))}
              </div>
            </div>

            <div className="insights-list">
              {filteredInsights.length > 0 ? (
                filteredInsights.map(insight => (
                  <div className="insight-card" key={insight.id} onClick={() => viewInsight(insight)}>
                    <h3 className="insight-title"><TranslatedText text={insight.title} /></h3>
                    <div className="insight-meta">
                      <span className="insight-category"><TranslatedText text={insight.category} /></span>
                      <span className="insight-date">{insight.publishDate}</span>
                    </div>
                    <p className="insight-preview">
                      <TranslatedText text={
                        insight.content.length > 150 
                          ? `${insight.content.substring(0, 150)}...` 
                          : insight.content
                      } />
                    </p>
                  </div>
                ))
              ) : (
                <div className="no-insights">
                  <i className="fas fa-lightbulb fa-3x"></i>
                  <p><TranslatedText text="No insights found matching your criteria. Try adjusting your search or filters." /></p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="insight-detail">
            <button className="back-btn" onClick={backToList}>
              <i className="fas fa-arrow-left"></i> <TranslatedText text="Back to Insights" />
            </button>
            
            <div className="insight-detail-header">
              <h2><TranslatedText text={selectedInsight.title} /></h2>
              <div className="insight-meta">
                <span className="insight-category"><TranslatedText text={selectedInsight.category} /></span>
                <span className="insight-source"><TranslatedText text={selectedInsight.source} /></span>
                <span className="insight-date">{selectedInsight.publishDate}</span>
              </div>
            </div>
            
            <div className="insight-content">
              {selectedInsight.detailedContent.split('\n\n').map((paragraph, index) => (
                <p key={index}><TranslatedText text={paragraph} /></p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Insights; 