import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import type { GeneratedPaper, Section, Question } from '@vedaai/shared';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metaText: {
    fontSize: 10,
    color: '#374151',
  },
  metaBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  instruction: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  studentField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  fieldLine: {
    width: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  sectionInstruction: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#6B7280',
    marginBottom: 8,
  },
  questionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 4,
  },
  questionNumber: {
    width: 24,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
  },
  questionText: {
    flex: 1,
    fontSize: 11,
  },
  questionMeta: {
    fontSize: 9,
    color: '#6B7280',
    marginLeft: 4,
    textAlign: 'right',
    width: 80,
  },
  optionRow: {
    flexDirection: 'row',
    marginLeft: 24,
    marginBottom: 2,
  },
  optionLabel: {
    width: 18,
    fontSize: 10,
    color: '#6B7280',
  },
  optionText: {
    fontSize: 10,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
  },
  endOfPaper: {
    textAlign: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
  },
});

const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

function PaperPDF({ paper }: { paper: GeneratedPaper }) {
  let questionCounter = 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {}
        <View style={styles.header}>
          <Text style={styles.title}>{paper.title}</Text>
          <Text style={styles.subtitle}>Subject: {paper.subject}</Text>
        </View>

        {}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Time Allowed: 45 minutes
          </Text>
          <Text style={styles.metaBold}>
            Maximum Marks: {paper.totalMarks}
          </Text>
        </View>

        {}
        <Text style={styles.instruction}>
          All questions are compulsory unless stated otherwise.
        </Text>

        {}
        <View style={styles.studentInfo}>
          <View style={styles.studentField}>
            <Text style={styles.fieldLabel}>Name:</Text>
            <View style={styles.fieldLine} />
          </View>
          <View style={styles.studentField}>
            <Text style={styles.fieldLabel}>Roll No:</Text>
            <View style={[styles.fieldLine, { width: 60 }]} />
          </View>
          <View style={styles.studentField}>
            <Text style={styles.fieldLabel}>Section:</Text>
            <View style={[styles.fieldLine, { width: 40 }]} />
          </View>
        </View>

        {}
        {paper.sections.map((section: Section, sIdx: number) => {
          const letter = sectionLetters[sIdx] || String(sIdx + 1);

          return (
            <View key={section.id} wrap={false}>
              <Text style={styles.sectionTitle}>Section {letter}</Text>
              <Text style={styles.sectionSubtitle}>{section.title}</Text>
              <Text style={styles.sectionInstruction}>
                {section.instruction}
              </Text>

              {section.questions.map((q: Question) => {
                questionCounter++;
                return (
                  <View key={q.id} style={{ marginBottom: 6 }}>
                    <View style={styles.questionRow}>
                      <Text style={styles.questionNumber}>
                        {questionCounter}.
                      </Text>
                      <Text style={styles.questionText}>
                        [{q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}]{' '}
                        {q.text} [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                      </Text>
                    </View>

                    {q.options &&
                      q.options.map((opt: string, oIdx: number) => (
                        <View key={oIdx} style={styles.optionRow}>
                          <Text style={styles.optionLabel}>
                            {String.fromCharCode(65 + oIdx)}.
                          </Text>
                          <Text style={styles.optionText}>{opt}</Text>
                        </View>
                      ))}
                  </View>
                );
              })}
            </View>
          );
        })}

        {}
        <Text style={styles.endOfPaper}>End of Question Paper</Text>

        {}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} — Generated by VedaAI`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

export async function generatePaperPDF(paper: GeneratedPaper): Promise<void> {
  const blob = await pdf(<PaperPDF paper={paper} />).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${paper.title.replace(/\s+/g, '_')}_${paper.subject}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
