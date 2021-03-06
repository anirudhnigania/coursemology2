import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { categoryShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const styles = {
  selectLink: {
    marginLeft: 20,
    lineHeight: '24px',
  },
  deselectLink: {
    marginLeft: 10,
    lineHeight: '24px',
  },
};

const translations = defineMessages({
  selectAll: {
    id: 'course.duplication.AssessmentsSelector.selectAll',
    defaultMessage: 'Select All',
  },
  deselectAll: {
    id: 'course.duplication.AssessmentsSelector.deselectAll',
    defaultMessage: 'Deselect All',
  },
  noItems: {
    id: 'course.duplication.AssessmentsSelector.noItems',
    defaultMessage: 'There are no assessment items to duplicate.',
  },
});

class AssessmentsSelector extends React.Component {
  static propTypes = {
    categories: PropTypes.arrayOf(categoryShape),
    selectedItems: PropTypes.shape(),

    dispatch: PropTypes.func.isRequired,
  }

  static renderBulkSelectors(bulkSelectorMethod, item) {
    return (
      <div>
        <a
          onTouchTap={() => bulkSelectorMethod(item, true)}
          style={styles.selectLink}
        >
          <FormattedMessage {...translations.selectAll} />
        </a>
        <a
          onTouchTap={() => bulkSelectorMethod(item, false)}
          style={styles.deselectLink}
        >
          <FormattedMessage {...translations.deselectAll} />
        </a>
      </div>
    );
  }

  tabSetAll = (tab, value) => {
    const { dispatch } = this.props;
    dispatch(setItemSelectedBoolean(TAB, tab.id, value));
    tab.assessments.forEach((assessment) => {
      dispatch(setItemSelectedBoolean(ASSESSMENT, assessment.id, value));
    });
  }

  categorySetAll = (category, value) => {
    this.props.dispatch(setItemSelectedBoolean(CATEGORY, category.id, value));
    category.tabs.forEach(tab => this.tabSetAll(tab, value));
  }

  renderAssessmentTree(assessment) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, published } = assessment;
    const checked = !!selectedItems[ASSESSMENT][id];
    const label = (
      <span>
        <TypeBadge itemType={ASSESSMENT} />
        { published || <UnpublishedIcon /> }
        { title }
      </span>
    );

    return (
      <IndentedCheckbox
        key={id}
        label={label}
        checked={checked}
        indentLevel={2}
        onCheck={(e, value) =>
          dispatch(setItemSelectedBoolean(ASSESSMENT, id, value))
        }
      />
    );
  }

  renderTabTree(tab) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, assessments } = tab;
    const checked = !!selectedItems[TAB][id];

    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          indentLevel={1}
          label={<span><TypeBadge itemType={TAB} />{ title }</span>}
          onCheck={(e, value) =>
            dispatch(setItemSelectedBoolean(TAB, id, value))
          }
        >
          { AssessmentsSelector.renderBulkSelectors(this.tabSetAll, tab) }
        </IndentedCheckbox>
        { assessments.map(assessment => this.renderAssessmentTree(assessment)) }
      </div>
    );
  }

  renderCategoryTree(category) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, tabs } = category;
    const checked = !!selectedItems[CATEGORY][id];

    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          label={<span><TypeBadge itemType={CATEGORY} />{ title }</span>}
          onCheck={(e, value) =>
            dispatch(setItemSelectedBoolean(CATEGORY, id, value))
          }
        >
          { AssessmentsSelector.renderBulkSelectors(this.categorySetAll, category) }
        </IndentedCheckbox>
        { tabs.map(tab => this.renderTabTree(tab)) }
      </div>
    );
  }

  render() {
    const { categories } = this.props;
    if (!categories) { return null; }

    return (
      <div>
        <h2><FormattedMessage {...defaultComponentTitles.course_assessments_component} /></h2>
        {
          categories.length > 0 ?
          categories.map(category => this.renderCategoryTree(category)) :
          <Subheader>
            <FormattedMessage {...translations.noItems} />
          </Subheader>
        }
      </div>
    );
  }
}

export default connect(({ objectDuplication }) => ({
  categories: objectDuplication.assessmentsComponent,
  selectedItems: objectDuplication.selectedItems,
}))(AssessmentsSelector);
