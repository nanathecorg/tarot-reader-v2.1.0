const STYLE_PROMPTS = {
  relationship_expert: `Reader style: Relationship Expert\n- strongest on attraction, mixed signals, attachment, pursuit, boundaries, uncertainty, and romantic dynamics\n- translate card symbolism into social and relational language\n- answer things like how they may see me, what the dynamic is, what is unsaid, and what I should do\n- be direct, emotionally intelligent, and grounded\n- do not write fan fiction or fake certainty about another person's hidden mind`,
  calm_logical_critic: `Reader style: Calm Logical Critic\n- sound composed, clear, and skeptical of wishful thinking\n- translate cards into practical pattern recognition and disciplined advice\n- cut through fantasy gently but firmly\n- highlight contradictions, denial, weak assumptions, and sloppy thinking when present\n- do not become cold or hostile; remain measured and useful`
};

const CALL1_SYSTEM = `You are the internal analysis layer for Tarot Reader.\n\nYou are not giving the final tarot reading yet.\nYour job is to analyze the user and the question the way a skilled tarot reader would think privately before speaking.\n\nIdentify:\n- what the user explicitly asked\n- what they are probably really asking underneath that\n- emotional state and pressure\n- hidden desire\n- hidden fear\n- what kind of answer they can best absorb right now\n- what tone the final reader should take\n- what the final reading must focus on\n- what the final reading must avoid\n\nRules:\n- Be perceptive, but do not invent unsupported facts.\n- Do not become creepy, overly intimate, or falsely familiar.\n- Do not flatter the user.\n- Do not use fake therapist language.\n- Do not give the final reading yet.\n- Prefer situational clarity over vague personality speculation.\n- If the question is about another person, analyze the user's need and the relational dynamic without pretending certainty about the other person's private mind.\n\nReturn valid JSON with keys:\nexplicit_question, likely_real_question, emotional_state, hidden_desire, hidden_fear, answer_style, directness_level, reading_focus, avoid, notes`;

const CALL2_SYSTEM = `You are Tarot Reader, a polished tarot-reading product for regular people.\n\nYou are giving the final reading.\nYou receive:\n- the user's question\n- a structured internal analysis brief\n- a seriousness and repetition check\n- a situational diagnosis\n- tarot cards with positions and orientations\n- a selected reader style\n\nRules:\n- Answer the actual question.\n- Use the cards as symbolic constraints and narrative anchors.\n- The person matters more than empty symbolism.\n- Do not become abstract when the question is concrete.\n- Do not sound over-friendly, clingy, creepy, or falsely intimate.\n- Do not flatter the user.\n- Do not use scammy urgency or manipulative fear.\n- Do not pretend certainty you do not have.\n- If the question is relational, speak in relational language.\n- If the user is implicitly asking what to do, provide clear guidance.\n- The reading should feel like a tarot reading, not generic life coaching.\n- The reader has authority and should not sound eager to please.\n\nOutput shape:\n1. Direct answer\n2. Card-by-card reading in context\n3. Spread synthesis\n4. What to do next\n5. Closing line`;

const DECK = [
['The Fool','A leap, openness, and the willingness to step into something not fully mapped.','Hesitation, reckless escape, or fear disguised as freedom.'],
['The Magician','Power, initiative, and the ability to turn intention into action.','Scattered energy, weak follow-through, or trying to force a result.'],
['The High Priestess','Intuition, hidden knowledge, and the need to listen beneath the noise.','Confusion, avoidance of inner truth, or overthinking what you already sense.'],
['The Empress','Abundance, attraction, comfort, and a fertile period for growth.','Smothering, stagnation, or comfort becoming complacency.'],
['The Emperor','Structure, control, and the need for clear standards or boundaries.','Rigidity, ego, or unstable authority.'],
['The Hierophant','Tradition, mentorship, and wisdom within established forms.','Empty rules, stale beliefs, or resisting needed guidance.'],
['The Lovers','Union, alignment, attraction, and meaningful choice.','Misalignment, mixed signals, or acting against deeper truth.'],
['The Chariot','Momentum, control, and pushing forward with purpose.','Loss of direction, inner conflict, or movement without control.'],
['Strength','Quiet power, emotional steadiness, and disciplined softness.','Self-doubt, reactive behavior, or forced confidence.'],
['The Hermit','Reflection, solitude, and wisdom gained by stepping back.','Isolation, over-withdrawal, or refusing guidance.'],
['Wheel of Fortune','Change, timing, and a larger cycle turning.','Resistance to change or feeling stuck in repetition.'],
['Justice','Truth, accountability, and consequences that make sense.','Bias, denial, or avoiding the full picture.'],
['The Hanged Man','Pause, surrender, and seeing from a different angle.','Delay without growth or refusing the needed pause.'],
['Death','Ending, shedding, and necessary transformation.','Clinging to what is already over.'],
['Temperance','Balance, healing, and patient integration.','Extremes, impatience, or inner imbalance.'],
['The Devil','Attachment, temptation, and the grip of unhealthy patterns.','Breaking a pattern, or seeing the chain clearly.'],
['The Tower','Disruption, truth breaking through, and forced change.','Avoided collapse, delayed truth, or unstable foundations.'],
['The Star','Hope, renewal, and trust in what is slowly opening.','Discouragement, disconnection, or dimmed faith.'],
['The Moon','Uncertainty, emotion, projection, and unclear terrain.','Things surfacing, illusion thinning, or hidden fear being named.'],
['The Sun','Clarity, confidence, visibility, and joyful momentum.','Temporary cloudiness, delayed warmth, or reduced clarity.'],
['Judgement','Wake-up call, reckoning, and a chance to respond honestly.','Avoiding the lesson or being too harsh with yourself.'],
['The World','Completion, integration, and stepping into a fuller chapter.','Something unfinished or a threshold not fully crossed.'],
['Ace of Cups','Fresh feeling, openness of heart, and emotional beginning.','Blocked feeling or emotion held too tightly.'],
['Ace of Pentacles','A grounded new start, practical opportunity, or something real taking root.','A missed opening, weak foundation, or hesitation around receiving.'],
['Ace of Swords','Truth cutting through, mental clarity, and a decisive insight.','Confusion, distorted thinking, or truth not yet fully faced.'],
['Ace of Wands','Spark, desire, initiative, and a live creative charge.','Low energy, hesitation, or inspiration with no channel.'],
['Two of Cups','Mutuality, connection, and emotional reciprocity.','Mismatch, imbalance, or one-sided effort.'],
['Two of Swords','Stalemate, avoidance, or a choice delayed by overprotection.','Truth creeping in, tension rising, and indecision becoming costly.'],
['Two of Wands','Planning, possibility, and standing at the edge of a bigger move.','Playing small, fear of expansion, or waiting too long.'],
['Three of Cups','Joy, support, friendship, and emotional uplift through others.','Social messiness, overindulgence, or feeling outside the circle.'],
['Three of Pentacles','Collaboration, visible skill, and building something with care.','Misalignment in teamwork or work not meeting the standard.'],
['Three of Swords','Heartbreak, disappointment, or painful clarity.','Healing after pain or pain that is still being resisted.'],
['Three of Wands','Expansion, anticipation, and the first signs of forward motion.','Frustrated progress or a future vision that lacks execution.'],
['Four of Cups','Emotional withdrawal, boredom, or not seeing what is being offered.','Re-engagement, openness, or a new willingness to feel.'],
['Four of Pentacles','Holding on, guarding resources, and fear around loss.','Loosening control or instability around what you value.'],
['Four of Swords','Rest, recovery, and strategic stillness.','Restlessness, burnout, or refusing the reset you need.'],
['Four of Wands','Stability, celebration, and a supportive foundation.','Instability at home or joy that feels delayed.'],
['Five of Cups','Grief, fixation on loss, and difficulty seeing what remains.','Turning back toward what is still possible.'],
['Five of Pentacles','Lack, exclusion, or fear around support and security.','Recovery, help nearby, or the beginning of relief.'],
['Five of Swords','Conflict, ego, and winning at a cost.','Repair, regret, or walking away from petty war.'],
['Five of Wands','Friction, competition, and noisy conflicting energies.','Conflict settling or avoiding challenge that would sharpen you.'],
['Six of Cups','Memory, sweetness, nostalgia, and the pull of the familiar.','Staying too attached to an older emotional script.'],
['Six of Pentacles','Exchange, support, generosity, and balance in giving/receiving.','Strings attached, imbalance, or dependence.'],
['Six of Swords','Transition, release, and movement toward calmer water.','Trouble letting go or carrying too much into the next chapter.'],
['Six of Wands','Recognition, confidence, and visible success.','Need for validation or success feeling unsteady.'],
['Seven of Cups','Options, fantasy, and the temptation of too many possibilities.','Narrowing focus or seeing through illusion.'],
['Seven of Pentacles','Patience, evaluation, and asking whether the effort is worth it.','Impatience or draining energy into something with weak return.'],
['Seven of Swords','Strategy, concealment, or acting sideways instead of directly.','Truth surfacing, self-deception cracking, or cleaner tactics needed.'],
['Seven of Wands','Defensiveness, courage, and holding your ground under pressure.','Exhaustion, collapse of boundaries, or fighting from depletion.'],
['Eight of Cups','Leaving behind what no longer feeds the soul.','Avoidance, unfinished departure, or fear of necessary loss.'],
['Eight of Pentacles','Practice, skill-building, and focused improvement.','Busy work, weak discipline, or effort without refinement.'],
['Eight of Swords','Mental trapping, fear, or a story that shrinks your options.','Release beginning, perspective widening, or fear being named.'],
['Eight of Wands','Speed, momentum, and events moving quickly.','Delays, scattered motion, or crossed signals.'],
['Nine of Cups','Pleasure, satisfaction, and desire landing well.','Overindulgence, emptiness after getting what you wanted, or shallow fulfillment.'],
['Nine of Pentacles','Self-sufficiency, earned ease, and cultivated taste.','Dependence, fragility, or comfort that hides isolation.'],
['Nine of Swords','Anxiety, mental spirals, and fear amplified in the dark.','Relief beginning or the fear losing some power.'],
['Nine of Wands','Guarded persistence, resilience, and weary boundaries.','Exhaustion, defensiveness, or expecting a hit before it comes.'],
['Page of Cups','Curiosity, tenderness, and emotional messages.','Immaturity, mixed signals, or over-romanticizing.'],
['Page of Pentacles','A practical beginning, study, and grounded opportunity.','Lack of follow-through or weak commitment to the opportunity.'],
['Page of Swords','Alertness, curiosity, and restless mental energy.','Spying, scattered focus, or reactive communication.'],
['Page of Wands','Adventure, spark, and a playful invitation to begin.','False start, low confidence, or energy without a plan.'],
['Knight of Cups','Romance, invitation, and moving toward what the heart wants.','Idealization, inconsistency, or promise without grounding.'],
['Knight of Pentacles','Steadiness, method, and dependable effort.','Stagnation, over-caution, or joyless grinding.'],
['Knight of Swords','Fast movement, sharp intent, and direct pursuit.','Impulsiveness, aggression, or rushing without wisdom.'],
['Knight of Wands','Bold pursuit, heat, and dramatic forward energy.','Chaos, inconsistency, or energy that burns too hot.'],
['Queen of Cups','Emotional depth, compassion, and intuitive receptivity.','Blurred boundaries, moodiness, or taking in too much.'],
['Queen of Pentacles','Grounded care, resourcefulness, and practical warmth.','Overextension or care that neglects the self.'],
['Queen of Swords','Discernment, honesty, and clear-eyed independence.','Bitterness, coldness, or cutting too quickly.'],
['Queen of Wands','Magnetism, confidence, and self-possessed creative fire.','Insecurity covered by performance or envy in the room.'],
['King of Cups','Emotional mastery, calm authority, and measured feeling.','Suppression, moodiness, or emotional control issues.'],
['King of Pentacles','Stable success, stewardship, and mature material judgment.','Control, greed, or values flattening into pure security.'],
['King of Swords','Clarity, strategy, and authoritative reasoning.','Harsh judgment, detachment, or cleverness without heart.'],
['King of Wands','Vision, leadership, and bold but directed fire.','Domineering force, ego, or inspiration with weak discipline.'],
['Ten of Cups','Emotional fulfillment, belonging, and heart-level harmony.','Disconnection, idealized family story, or happiness that needs repair.'],
['Ten of Pentacles','Long-term stability, legacy, and secure structure.','Instability in the long game or values out of alignment.'],
['Ten of Swords','Painful ending, finality, and no more pretending.','Recovery, surviving the worst, and refusing a dead story.'],
['Ten of Wands','Burden, overcommitment, and carrying too much alone.','Release, delegation, or refusing unnecessary weight.']
];

const SPREADS = {
  single: { name: 'Single card', positions: ['Message'] },
  three: { name: 'Past · Present · Advice', positions: ['Past', 'Present', 'Advice'] },
  crossroads: { name: 'Situation · Obstacle · Advice · Direction', positions: ['Situation', 'Obstacle', 'Advice', 'Direction'] },
  relationship: { name: 'How they feel · What is hidden · What to do', positions: ['How they feel', 'What is hidden', 'What to do'] },
};

function drawCards(spreadKey) {
  const spread = SPREADS[spreadKey] || SPREADS.three;
  const pool = [...DECK];
  return spread.positions.map(position => {
    const idx = Math.floor(Math.random() * pool.length);
    const [name, upright, reversed] = pool.splice(idx, 1)[0];
    return {
      name,
      position,
      orientation: Math.random() < 0.74 ? 'upright' : 'reversed',
      meanings: { upright, reversed }
    };
  });
}

async function openaiChat(messages, { temperature = 0.8, response_format } = {}) {
  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    messages,
    temperature,
    max_tokens: 750
  };
  if (response_format) payload.response_format = response_format;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  return data.choices[0].message.content;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!payload.question || !String(payload.question).trim()) return res.status(400).json({ ok: false, error: 'Missing question' });
    if (!process.env.OPENAI_API_KEY) return res.status(400).json({ ok: false, error: 'Missing OPENAI_API_KEY in Vercel environment' });
    const spreadKey = payload.spreadKey || 'three';
    const cards = drawCards(spreadKey);

    const call1Payload = {
      user_profile: {
        name: payload.name || 'Seeker',
        focus: payload.focus || 'general',
        energy: payload.energy || 'uncertain',
        interests: payload.interests || []
      },
      question: payload.question,
      spread_key: spreadKey,
      spread_name: SPREADS[spreadKey]?.name || SPREADS.three.name,
      reader_style: payload.readerStyle || 'relationship_expert',
      ritual_notes: {
        desired_answer: payload.desiredAnswer || '',
        feared_truth: payload.fearedTruth || '',
        situation_label: payload.situationLabel || ''
      }
    };

    const briefRaw = await openaiChat([
      { role: 'system', content: CALL1_SYSTEM },
      { role: 'user', content: JSON.stringify(call1Payload, null, 2) }
    ], { temperature: 0.45, response_format: { type: 'json_object' } });
    const brief = JSON.parse(briefRaw);

    const checkSystem = `You are the gatekeeping layer for Tarot Reader. Judge whether the question is serious, vague, repeated in substance, manipulative, or unserious. Return valid JSON with keys: seriousness, question_quality, should_refuse, should_redirect, repetition_risk, guidance_to_reader, refinement_note.`;
    const checkRaw = await openaiChat([
      { role: 'system', content: checkSystem },
      { role: 'user', content: JSON.stringify({ question: payload.question, focus: payload.focus, desired_answer: payload.desiredAnswer || '', feared_truth: payload.fearedTruth || '', prior_brief: brief }, null, 2) }
    ], { temperature: 0.2, response_format: { type: 'json_object' } });
    const questionCheck = JSON.parse(checkRaw);

    const diagnosisSystem = `You are the situational diagnosis layer for Tarot Reader. Infer the emotional and situational core of the user problem without giving the final reading yet. Return valid JSON with keys: core_tension, relational_dynamic, internal_conflict, likely_block, what_the_reader_should_press_on.`;
    const diagnosisRaw = await openaiChat([
      { role: 'system', content: diagnosisSystem },
      { role: 'user', content: JSON.stringify({ question: payload.question, user_profile: call1Payload.user_profile, analysis_brief: brief, question_check: questionCheck }, null, 2) }
    ], { temperature: 0.35, response_format: { type: 'json_object' } });
    const diagnosis = JSON.parse(diagnosisRaw);

    const call2Payload = {
      question: payload.question,
      reader_style: payload.readerStyle || 'relationship_expert',
      analysis_brief: brief,
      question_check: questionCheck,
      situational_diagnosis: diagnosis,
      spread: { key: spreadKey, name: SPREADS[spreadKey]?.name || SPREADS.three.name },
      cards,
      output_requirements: {
        concrete_and_graspable: true,
        avoid_empty_abstraction: true,
        anti_creepy: true,
        give_action_guidance_when_useful: true,
        reader_authority: true
      }
    };

    const reading = await openaiChat([
      { role: 'system', content: `${CALL2_SYSTEM}\n\n${STYLE_PROMPTS[payload.readerStyle || 'relationship_expert']}` },
      { role: 'user', content: JSON.stringify(call2Payload, null, 2) }
    ], { temperature: 0.82 });

    return res.status(200).json({
      ok: true,
      brief: { ...brief, question_check: questionCheck, situational_diagnosis: diagnosis },
      reading,
      cards,
      spread_name: SPREADS[spreadKey]?.name || SPREADS.three.name,
      reader_style: payload.readerStyle || 'relationship_expert'
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: String(error.message || error) });
  }
}
