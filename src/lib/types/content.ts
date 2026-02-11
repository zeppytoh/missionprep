// Content Block Types for Mission Prep LMS

// Base block interface
export interface BaseBlock {
	id?: string;
	type: string;
}

// Text block - markdown/HTML body content
export interface TextBlock extends BaseBlock {
	type: 'text';
	heading?: string;
	body: string;
}

// Video block - YouTube embed
export interface VideoBlock extends BaseBlock {
	type: 'video';
	url: string;
	title?: string;
	duration?: number; // seconds
}

// Info box - highlighted callout with variants
export interface InfoBoxBlock extends BaseBlock {
	type: 'info-box';
	heading?: string;
	content: string;
}

// Key point - summary takeaway
export interface KeyPointBlock extends BaseBlock {
	type: 'key-point';
	heading?: string;
	content: string;
}

// Activity - inquiry-based learning activity
export interface ActivityBlock extends BaseBlock {
	type: 'activity';
	title: string;
	setup?: string;
	investigation?: string;
	discovery?: string;
	application?: string;
}

// Case study - scenario card
export interface CaseStudyBlock extends BaseBlock {
	type: 'case-study';
	title: string;
	situation: string;
	diagnosis: string;
	solution: string;
}

// Quiz block - interactive assessment
export interface QuizBlock extends BaseBlock {
	type: 'quiz';
	questions: QuizQuestion[];
	passingScore: number;
	isCompletionQuiz: boolean;
}

// Reflection block - personal notes
export interface ReflectionBlock extends BaseBlock {
	type: 'reflection';
	id: string; // unique identifier for this reflection
	question: string;
	initialValue?: string;
}

// Embed block - external iframe
export interface EmbedBlock extends BaseBlock {
	type: 'embed';
	url: string;
	title?: string;
	height?: number; // pixels
}

// Union type of all content blocks
export type ContentBlock =
	| TextBlock
	| VideoBlock
	| InfoBoxBlock
	| KeyPointBlock
	| ActivityBlock
	| CaseStudyBlock
	| QuizBlock
	| ReflectionBlock
	| EmbedBlock;

// Page within a module
export interface ModulePage {
	id: string; // page-1, page-2, etc.
	title: string;
	pageType:
		| 'introduction'
		| 'section'
		| 'case-study'
		| 'reference'
		| 'summary'
		| 'prayer-guide';
	blocks: ContentBlock[];
}

// Quiz question
export interface QuizQuestion {
	id: string;
	question: string;
	options: Array<{ id: string; text: string }>;
	correct: string; // The ID of the correct option (e.g., "a", "b", "c", "d")
	explanation: string;
}

export interface QuizConfig {
	questions: QuizQuestion[];
	passingScore: number; // percentage
	allowRetake: boolean;
}

// Reflection configuration (separate from inline reflection blocks)
export interface ReflectionPrompt {
	id: string;
	prompt: string;
	required: boolean;
	minLength?: number;
}

export interface ReflectionConfig {
	prompts: ReflectionPrompt[];
}

// Module metadata (from frontmatter)
export interface ModuleMetadata {
	slug: string;
	title: string;
	tier: 1 | 2;
	order: number;
	estimatedMinutes: number;
	prerequisites: string[]; // slugs of prerequisite modules
	description?: string;
}

// Full parsed module
export interface ParsedModule {
	metadata: ModuleMetadata;
	pages: ModulePage[];
	quiz?: QuizConfig;
	reflections?: ReflectionConfig;
}

// Module status in database
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

// User progress for a module
export interface UserProgress {
	id: number;
	userId: string;
	moduleId: number;
	status: ModuleStatus;
	currentPage: number;
	quizScore: number | null;
	quizAttempts: number;
	reflectionsData: Record<string, string>; // { reflectionId: text }
	startedAt: Date | null;
	completedAt: Date | null;
}
